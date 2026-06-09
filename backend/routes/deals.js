const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

let cachedDeals = null;
let lastUpdated = 0;
let lastSeed = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const DEAL_LIMIT = 12;

const normalize = (s) =>
    (s || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getDaySeed = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const seededScore = (str, seed) => {
    let h = 0;
    const input = `${str}-${seed}`;

    for (let i = 0; i < input.length; i++) {
        h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
    }

    return Math.abs(h);
};

const isReasonableDeal = ({ product, avg, savings, score, groupSize }) => {
    const category = normalize(product.category || product.aisle || '');
    const name = normalize(product.name);

    if (groupSize < 2) return false;
    if (!product.image_url) return false;
    if (!Number.isFinite(avg) || !Number.isFinite(product.price)) return false;

    if (product.price < 0.5 || product.price > 100) return false;
    if (avg < 1 || avg > 120) return false;

    if (savings < 0.75) return false;
    if (savings > 35) return false;

    if (score < 0.15 || score > 0.7) return false;

    const badTerms = [
        'airpods',
        'iphone',
        'ipad',
        'gift card',
        'newspaper',
        'magazine',
        'subscription'
    ];

    if (badTerms.some(term => name.includes(term))) return false;

    const weakCategories = ['miscellaneous', 'newspaper', 'magazines'];

    if (weakCategories.some(c => category.includes(c))) {
        return savings >= 2 && score >= 0.25;
    }

    return true;
};

router.get('/', async (req, res) => {
    const start = Date.now();

    try {
        const seed = getDaySeed();
        const cacheAge = Date.now() - lastUpdated;

        if (
            cachedDeals &&
            lastSeed === seed &&
            cacheAge < CACHE_TTL
        ) {
            res.set('X-Deals-Cache', 'HIT');
            res.set('Cache-Control', 'public, max-age=300');

            console.log(`Deals cache HIT: ${Date.now() - start}ms`);

            return res.json(cachedDeals);
        }

        console.log('Deals cache MISS: recalculating...');

        const rawProducts = await Product.find(
            {
                price: { $type: "number", $gt: 0.25, $lt: 100 },
                name: { $exists: true, $ne: "" },
                image_url: { $exists: true, $ne: "" }
            },
            {
                name: 1,
                price: 1,
                image_url: 1,
                quantity: 1,
                size_text: 1,
                category: 1,
                aisle: 1,
                store: 1,
                unitAmount: 1,
                unitType: 1,
                unitPrice: 1,
                unitPriceLabel: 1
            }
        )
            .lean();

        console.log(`Deals fetched products: ${rawProducts.length}`);

        const groups = Object.create(null);

        for (const p of rawProducts) {
            const price = Number(p.price);

            if (!Number.isFinite(price)) continue;

            const categoryKey = normalize(p.category || p.aisle || 'uncategorized');
            const nameKey = normalize(p.name);
            const quantityKey = normalize(p.quantity || p.size_text || '');

            if (!nameKey) continue;

            const key = `${categoryKey}|${nameKey}|${quantityKey}`;

            if (!groups[key]) groups[key] = [];

            groups[key].push({
                ...p,
                price
            });
        }

        const deals = [];

        for (const key of Object.keys(groups)) {
            const group = groups[key];

            if (group.length < 2) continue;

            let total = 0;

            for (const product of group) {
                total += product.price;
            }

            const avg = total / group.length;

            for (const product of group) {
                const savings = avg - product.price;
                const score = savings / avg;

                if (
                    isReasonableDeal({
                        product,
                        avg,
                        savings,
                        score,
                        groupSize: group.length
                    })
                ) {
                    deals.push({
                        product,
                        avg,
                        price: product.price,
                        savings,
                        score,
                        description: `This item is about ${(score * 100).toFixed(0)}% cheaper than similar ${product.category || product.aisle || 'grocery'} items in your data. Average matched price: $${avg.toFixed(2)}.`,
                        dealReason: `Compared against ${group.length} similar item${group.length === 1 ? '' : 's'} using name, category, and quantity.`
                    });
                }
            }
        }

        deals.sort((a, b) => {
            const aSeed = seededScore(a.product._id.toString(), seed);
            const bSeed = seededScore(b.product._id.toString(), seed);

            return (
                (b.score * 100000 - (bSeed % 5000)) -
                (a.score * 100000 - (aSeed % 5000))
            );
        });

        cachedDeals = deals.slice(0, DEAL_LIMIT);
        lastUpdated = Date.now();
        lastSeed = seed;

        res.set('X-Deals-Cache', 'MISS');
        res.set('Cache-Control', 'public, max-age=300');

        console.log(
            `Deals cache MISS complete: ${Date.now() - start}ms, deals=${cachedDeals.length}`
        );

        res.json(cachedDeals);

    } catch (err) {
        console.error("Deals error:", err);
        res.status(500).json({ message: 'Failed to load deals' });
    }
});

module.exports = router;