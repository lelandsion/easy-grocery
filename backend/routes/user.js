// routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Authentication middleware
const User = require('../models/User');
const Store = require("../models/Store");
const Product = require('../models/Product');

const normalize = (s) =>

    s.toLowerCase()

        .replace(/$begin:math:text$\.\*\?$end:math:text$/g, '')   // remove (12 pack)

        .replace(/[^a-z0-9 ]/g, '') // remove symbols

        .trim();

// Get user profile with populated favorites and shoppingLists
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('favorites') // Populate favorites with Product details
            .populate('shoppingLists.items') // Populate shopping list items with Product details

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items')

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stores = await Store.find();



        let listsCreated = user.shoppingLists.length;
        let itemsCompared = 0;
        let estimatedSavings = 0;

        for (const list of user.shoppingLists) {
            itemsCompared += list.items.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
            );
            estimatedSavings += Number(list.estimatedSavings || 0);
        }


        const normalize = (s) =>
            (s || '')
                .toLowerCase()
                .replace(/\(.*?\)/g, '')
                .replace(/[^a-z0-9 ]/g, '')
                .replace(/\s+/g, ' ')
                .trim();



        res.json({
            estimatedSavings,
            listsCreated,
            itemsCompared
        });

    } catch (err) {
        console.error(err);
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

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const list = user.shoppingLists.id(listId);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        list.estimatedSavings = Math.max(0, Number(savings));

        await user.save();

        res.json({
            message: 'Savings updated',
            estimatedSavings: list.estimatedSavings
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save savings' });
    }
});


router.get('/lists/:id/split', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        const list = user.shoppingLists.id(req.params.id);
        if (!list) return res.status(404).json({ message: "List not found" });

        let total = 0;
        const breakdown = [];
        const products = [];

        for (const product of list.items) {
            if (!product?.name) continue;

            const quantity = list.itemQuantities?.get(product._id.toString()) || 1;

            const matches = await Product.find({
                name: { $regex: product.name, $options: 'i' },
                price: { $gt: 0, $lt: 500 }
            }).lean();

            if (!matches.length) continue;

            const cheapest = matches.sort((a, b) => Number(a.price) - Number(b.price))[0];

            total += Number(cheapest.price || 0) * quantity;

            products.push({
                ...cheapest,
                listItemId: product._id,
                quantity
            });
        }

        res.json({ total, breakdown, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error calculating split cart" });
    }
});


router.get('/lists/:id/best-store', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        const list = user.shoppingLists.id(req.params.id);

        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        const stores = await Store.find();
        const results = [];

        const totalRequestedItems = list.items.reduce(
            (sum, product) =>
                sum + Number(list.itemQuantities?.get(product._id.toString()) || 1),
            0
        );

        const normalize = (s) =>
            (s || '')
                .toLowerCase()
                .replace(/\(.*?\)/g, '')
                .replace(/[^a-z0-9 ]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

        for (const store of stores) {
            let total = 0;
            let matchedCount = 0;
            let missing = 0;
            const matchedProducts = [];

            const storeProducts = await Product.find({
                store: store._id
            }).lean();

            for (const listProduct of list.items) {
                if (!listProduct?.name) continue;

                const itemName = normalize(listProduct.name);
                const quantity =
                    list.itemQuantities?.get(listProduct._id.toString()) || 1;

                let bestMatch = null;
                let bestScore = 0;

                for (const product of storeProducts) {
                    const productName = normalize(product.name);

                    let score = 0;

                    if (productName === itemName) score = 100;
                    else if (productName.includes(itemName) || itemName.includes(productName)) score = 70;
                    else {
                        const itemWords = itemName.split(' ');
                        const productWords = productName.split(' ');

                        const overlap = itemWords.filter(w =>
                            productWords.includes(w)
                        ).length;

                        score = overlap;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = product;
                    }
                }

                if (bestMatch && bestScore > 0) {
                    total += Number(bestMatch.price || 0) * quantity;
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

            results.push({
                store: store.name,
                storeId: store._id,
                total,
                matchedCount,
                missing,
                coverage: totalRequestedItems
                    ? matchedCount / totalRequestedItems
                    : 0,
                products: matchedProducts
            });
        }

        results.sort((a, b) => {
            if (b.coverage !== a.coverage) return b.coverage - a.coverage;
            return a.total - b.total;
        });

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error calculating best store" });
    }
});
router.get('/lists', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('shoppingLists.items');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const listsWithProducts = user.shoppingLists.map(list => ({
            _id: list._id,
            name: list.name,
            estimatedSavings: list.estimatedSavings || 0,
            items: list.items.map(product => ({
                ...product.toObject(),
                listItemId: product._id,
                quantity: list.itemQuantities?.get(product._id.toString()) || 1
            }))
        }));

        res.json(listsWithProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch shopping lists' });
    }
});
router.get('/lists/recommend/preview', auth, async (req, res) => {
    try {
        const stapleTerms = [
            'milk',
            'eggs',
            'bread',
            'banana',
            'chicken',
            'rice',
            'pasta',
            'apple',
            'cheese',
            'yogurt'
        ];

        const products = [];

        for (const term of stapleTerms) {
            const product = await Product.findOne({
                name: { $regex: term, $options: 'i' },
                price: { $gt: 0, $lt: 100 }
            }).sort({ price: 1 }).lean();

            if (product) products.push(product);
        }

        res.json({
            name: 'Recommended Weekly Groceries',
            items: products
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to preview recommended list' });
    }
});

router.post('/lists/recommend', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stapleTerms = [
            'milk',
            'eggs',
            'bread',
            'banana',
            'chicken',
            'rice',
            'pasta',
            'apple',
            'cheese',
            'yogurt'
        ];

        const products = [];

        for (const term of stapleTerms) {
            const product = await Product.findOne({
                name: { $regex: term, $options: 'i' },
                price: { $gt: 0, $lt: 100 }
            }).sort({ price: 1 });

            if (product) products.push(product._id);
        }

        const uniqueProducts = [...new Set(products.map(id => id.toString()))];

        user.shoppingLists.push({
            name: 'Recommended Weekly Staples',
            items: uniqueProducts,
            itemQuantities: Object.fromEntries(
                uniqueProducts.map(id => [id, 1])
            )
        });

        await user.save();

        res.status(201).json({
            message: 'Recommended list created',
            lists: user.shoppingLists
        });

    } catch (err) {
        console.error(err);
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

        const currentQty = list.itemQuantities?.get(productId) || 0;
        list.itemQuantities.set(productId, currentQty + 1);

        await user.save();

        res.json({ message: "Added to list", list });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add item to list' });
    }
});
// Create a new shopping list
router.post('/lists', auth, async (req, res) => {
    const { name, items } = req.body; // Items should be an array of product IDs
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.shoppingLists.push({
            name,
            items: items || [],
            itemQuantities: Object.fromEntries(
                (items || []).map(id => [id, 1])
            )
        });
        await user.save();
        res.status(201).json({ message: 'Shopping list created', lists: user.shoppingLists });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create shopping list' });
    }
});



// Update an existing shopping list
/*router.put('/lists/:listId', auth, async (req, res) => {
    const { listId } = req.params;
    const { name, items } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const list = user.shoppingLists.id(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.name = name || list.name;
        list.items = items || list.items;
        await user.save();
        res.json({ message: 'Shopping list updated', list });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update shopping list' });
    }
});*/

router.delete('/lists/:listId/items/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const list = user.shoppingLists.id(req.params.listId);

        if (!list) return res.status(404).json({ message: 'List not found' });

        const productId = req.params.productId;
        const currentQty = list.itemQuantities?.get(productId) || 1;

        if (currentQty > 1) {
            list.itemQuantities.set(productId, currentQty - 1);
        } else {
            list.items = list.items.filter(id => id.toString() !== productId);
            list.itemQuantities.delete(productId);
        }

        await user.save();

        res.json({ message: 'Item removed', list });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove item' });
    }
});
// Delete a shopping list
router.delete('/lists/:listId', auth, async (req, res) => {
    const { listId } = req.params;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.shoppingLists = user.shoppingLists.filter(list => list._id.toString() !== listId);
        await user.save();
        res.json({ message: 'Shopping list deleted', lists: user.shoppingLists });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete shopping list' });
    }
});

// Add a product to user's favorites (protected route)
router.post('/favorites', auth, async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.favorites.push(productId);  // Add product to favorites
        await user.save();
        res.json({ message: 'Product added to favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add favorite' });
    }
});

// Get user's favorite products
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.favorites);
        console.log('favorites retrieved from MongoDB:', user.favorites)
    } catch (error) {
        console.error('Error retrieving favorites', error)
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});

// Remove a product from user's favorites (protected route)
router.delete('/favorites/:productId', auth, async (req, res) => {
    const { productId } = req.params;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.favorites = user.favorites.filter(id => id.toString() !== productId);
        await user.save();
        res.json({ message: 'Product removed from favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove favorite' });
    }
});

module.exports = router;