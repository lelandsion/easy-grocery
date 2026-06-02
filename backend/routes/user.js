const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Store = require("../models/Store");
const Product = require('../models/Product');

const normalize = (s) =>
    (s || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const getQuantity = (list, productId) => {
    const id = productId.toString();

    if (!list.itemQuantities) return 1;

    if (typeof list.itemQuantities.get === 'function') {
        return list.itemQuantities.get(id) || 1;
    }

    return list.itemQuantities[id] || 1;
};

const findBestProductMatch = (listProduct, candidates) => {
    const itemName = normalize(listProduct.name);
    const itemCategory = normalize(listProduct.category || listProduct.aisle || '');

    const itemWords = itemName
        .split(' ')
        .filter(Boolean)
        .filter(w => w.length > 2);

    let bestMatch = null;
    let bestScore = 0;

    for (const product of candidates) {
        if (!product?.name) continue;

        const price = Number(product.price);
        if (!Number.isFinite(price) || price <= 0 || price >= 500) continue;

        const productName = product.normalizedName || normalize(product.name);
        const productCategory =
            product.normalizedCategory ||
            normalize(product.category || product.aisle || '');

        if (itemCategory && productCategory && itemCategory !== productCategory) {
            continue;
        }

        let score = 0;

        if (productName === itemName) {
            score = 100;
        } else if (productName.includes(itemName) || itemName.includes(productName)) {
            score = 70;
        } else {
            const productWords = productName
                .split(' ')
                .filter(Boolean)
                .filter(w => w.length > 2);

            const overlap = itemWords.filter(w =>
                productWords.includes(w)
            ).length;

            score = overlap * 10;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = product;
        }
    }

    return bestScore > 0 ? bestMatch : null;
};

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('favorites')
            .populate('shoppingLists.items');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('shoppingLists.items');
        if (!user) return res.status(404).json({ message: 'User not found' });

        let listsCreated = user.shoppingLists.length;
        let itemsCompared = 0;
        let estimatedSavings = 0;

        for (const list of user.shoppingLists) {
            itemsCompared += list.items.reduce(
                (sum, product) => sum + getQuantity(list, product._id),
                0
            );
            estimatedSavings += Number(list.estimatedSavings || 0);
        }

        res.json({ estimatedSavings, listsCreated, itemsCompared });
    } catch (err) {
        res.status(500).json({ message: 'Failed to calculate stats' });
    }
});

router.post('/stats/savings', auth, async (req, res) => {
    try {
        const { listId, savings } = req.body;
        if (!listId || savings == null) {
            return res.status(400).json({ message: 'Missing listId or savings' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const list = user.shoppingLists.id(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.estimatedSavings = Math.max(0, Number(savings));
        await user.save();

        res.json({ message: 'Savings updated', estimatedSavings: list.estimatedSavings });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save savings' });
    }
});

router.get('/lists', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const listsWithProducts = user.shoppingLists.map(list => ({
            _id: list._id,
            name: list.name || 'Untitled List',
            estimatedSavings: list.estimatedSavings || 0,
            items: (list.items || [])
                .filter(product => product && product.name)
                .map(product => ({
                    ...product.toObject(),
                    listItemId: product._id,
                    quantity: getQuantity(list, product._id)
                }))
        }));

        res.json(listsWithProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch shopping lists' });
    }
});

router.get('/lists/:id/split', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const list = user.shoppingLists.id(req.params.id);

        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        const validListItems = (list.items || []).filter(product => product?.name);

        if (validListItems.length === 0) {
            return res.json({
                total: 0,
                breakdown: [],
                products: []
            });
        }

        const categories = [
            ...new Set(
                validListItems
                    .map(product => product.category || product.aisle)
                    .filter(Boolean)
            )
        ];

        const query = {
            price: { $gt: 0, $lt: 500 },
            name: { $exists: true, $ne: "" }
        };

        if (categories.length > 0) {
            query.$or = [
                { category: { $in: categories } },
                { aisle: { $in: categories } }
            ];
        }

        const candidates = await Product.find(query)
            .select('name price image_url quantity category aisle store unitAmount unitType unitPrice unitPriceLabel product_url')
            .lean();

        const preparedCandidates = candidates.map(product => ({
            ...product,
            normalizedName: normalize(product.name),
            normalizedCategory: normalize(product.category || product.aisle || '')
        }));

        let total = 0;
        const breakdown = [];
        const products = [];

        for (const listProduct of validListItems) {
            const quantity = getQuantity(list, listProduct._id);

            const bestMatch = findBestProductMatch(listProduct, preparedCandidates);

            if (!bestMatch) {
                continue;
            }

            const itemTotal = Number(bestMatch.price || 0) * quantity;
            total += itemTotal;

            breakdown.push({
                item: listProduct.name,
                store: bestMatch.store,
                price: bestMatch.price,
                quantity,
                total: itemTotal
            });

            products.push({
                ...bestMatch,
                listItemId: listProduct._id,
                quantity
            });
        }

        res.json({
            total: Number(total),
            breakdown,
            products
        });

    } catch (err) {
        console.error("Split route error:", err);
        res.status(500).json({ message: "Error calculating split cart" });
    }
});
router.get('/lists/:id/best-store', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const list = user.shoppingLists.id(req.params.id);

        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        const validListItems = (list.items || []).filter(product => product?.name);

        if (validListItems.length === 0) {
            return res.json([]);
        }

        const stores = await Store.find().lean();

        const totalRequestedItems = validListItems.reduce(
            (sum, product) => sum + getQuantity(list, product._id),
            0
        );

        const categories = [
            ...new Set(
                validListItems
                    .map(product => product.category || product.aisle)
                    .filter(Boolean)
            )
        ];

        const baseProductQuery = {
            price: { $gt: 0, $lt: 500 },
            name: { $exists: true, $ne: "" }
        };

        if (categories.length > 0) {
            baseProductQuery.$or = [
                { category: { $in: categories } },
                { aisle: { $in: categories } }
            ];
        }

        const allCandidateProducts = await Product.find(baseProductQuery)
            .select(
                'name price image_url quantity category aisle store unitAmount unitType unitPrice unitPriceLabel product_url'
            )
            .lean();

        const productsByStore = {};

        for (const product of allCandidateProducts) {
            const storeId = product.store?.toString();

            if (!storeId) continue;

            if (!productsByStore[storeId]) {
                productsByStore[storeId] = [];
            }

            productsByStore[storeId].push({
                ...product,
                normalizedName: normalize(product.name),
                normalizedCategory: normalize(product.category || product.aisle || '')
            });
        }

        const results = stores.map(store => {
            const storeId = store._id.toString();
            const storeProducts = productsByStore[storeId] || [];

            let total = 0;
            let matchedCount = 0;
            let missing = 0;
            const matchedProducts = [];

            for (const listProduct of validListItems) {
                const quantity = getQuantity(list, listProduct._id);

                const bestMatch = findBestProductMatch(listProduct, storeProducts);

                if (bestMatch) {
                    const itemTotal = Number(bestMatch.price || 0) * quantity;

                    total += itemTotal;
                    matchedCount += quantity;

                    matchedProducts.push({
                        ...bestMatch,
                        listItemId: listProduct._id,
                        quantity
                    });
                } else {
                    missing += quantity;
                }
            }

            return {
                store: store.name,
                storeId: store._id,
                total: Number(total),
                matchedCount,
                missing,
                coverage: totalRequestedItems
                    ? matchedCount / totalRequestedItems
                    : 0,
                products: matchedProducts
            };
        });

        results.sort((a, b) => {
            if (b.coverage !== a.coverage) {
                return b.coverage - a.coverage;
            }

            return a.total - b.total;
        });

        res.json(results);

    } catch (err) {
        console.error("Best-store route error:", err);
        res.status(500).json({ message: "Error calculating best store" });
    }
});
router.get('/lists/recommend/preview', auth, async (req, res) => {
    try {
        const stapleTerms = ['milk', 'eggs', 'bread', 'banana', 'chicken', 'rice', 'pasta', 'apple', 'cheese', 'yogurt'];
        const products = [];

        for (const term of stapleTerms) {
            const product = await Product.findOne({
                name: { $regex: term, $options: 'i' },
                price: { $gt: 0, $lt: 100 }
            }).sort({ price: 1 }).lean();

            if (product) products.push(product);
        }

        res.json({ name: 'Recommended Weekly Groceries', items: products });
    } catch (err) {
        res.status(500).json({ message: 'Failed to preview recommended list' });
    }
});

router.post('/lists/recommend', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const stapleTerms = ['milk', 'eggs', 'bread', 'banana', 'chicken', 'rice', 'pasta', 'apple', 'cheese', 'yogurt'];
        const products = [];

        for (const term of stapleTerms) {
            const product = await Product.findOne({
                name: { $regex: term, $options: 'i' },
                price: { $gt: 0, $lt: 100 }
            }).sort({ price: 1 });

            if (product) products.push(product._id.toString());
        }

        const uniqueProducts = [...new Set(products)];

        user.shoppingLists.push({
            name: 'Recommended Weekly Staples',
            items: uniqueProducts,
            itemQuantities: new Map(uniqueProducts.map(id => [id, 1]))
        });

        await user.save();

        res.status(201).json({ message: 'Recommended list created', lists: user.shoppingLists });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create recommended list' });
    }
});

router.post('/lists/:listId/items', auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const list = user.shoppingLists.id(req.params.listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const exists = list.items.some(id => id.toString() === productId);

        if (!exists) {
            list.items.push(productId);
        }

        if (!list.itemQuantities) {
            list.itemQuantities = new Map();
        }

        const currentQty = getQuantity(list, productId);
        list.itemQuantities.set(productId.toString(), exists ? currentQty + 1 : 1);

        await user.save();

        res.json({ message: "Added to list", list });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add item to list' });
    }
});

router.post('/lists', auth, async (req, res) => {
    const { name, items } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const productIds = (items || []).map(id => id.toString());

        user.shoppingLists.push({
            name,
            items: productIds,
            itemQuantities: new Map(productIds.map(id => [id, 1]))
        });

        await user.save();

        res.status(201).json({ message: 'Shopping list created', lists: user.shoppingLists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create shopping list' });
    }
});

router.delete('/lists/:listId/items/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const list = user.shoppingLists.id(req.params.listId);

        if (!list) return res.status(404).json({ message: 'List not found' });

        const productId = req.params.productId;
        const currentQty = getQuantity(list, productId);

        if (currentQty > 1) {
            list.itemQuantities.set(productId, currentQty - 1);
        } else {
            list.items = list.items.filter(id => id.toString() !== productId);

            if (list.itemQuantities) {
                list.itemQuantities.delete(productId);
            }
        }

        await user.save();

        res.json({ message: 'Item removed', list });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove item' });
    }
});

router.delete('/lists/:listId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.shoppingLists = user.shoppingLists.filter(
            list => list._id.toString() !== req.params.listId
        );

        await user.save();

        res.json({ message: 'Shopping list deleted', lists: user.shoppingLists });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete shopping list' });
    }
});

router.post('/favorites', auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.favorites.some(id => id.toString() === productId)) {
            user.favorites.push(productId);
        }

        await user.save();

        res.json({ message: 'Product added to favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add favorite' });
    }
});

router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});

router.delete('/favorites/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.favorites = user.favorites.filter(
            id => id.toString() !== req.params.productId
        );

        await user.save();

        res.json({ message: 'Product removed from favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove favorite' });
    }
});

module.exports = router;