const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ---- simple in-memory cache ----
let cachedDeals = null;
let lastUpdated = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

const normalize = (s) =>
    (s || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

router.get('/', async (req, res) => {
    try {
        // ✅ return cached result if fresh
        if (cachedDeals && Date.now() - lastUpdated < CACHE_TTL) {
            return res.json(cachedDeals);
        }

        // ✅ only fetch what you need
        const rawProducts = await Product.find(
            {},
            { name: 1, price: 1, image_url: 1 } // projection = faster
        ).lean();

        // ✅ normalize ONCE
        const products = rawProducts.map(p => ({
            ...p,
            normalized: normalize(p.name)
        }));

        // ✅ group products (O(n))
        const groups = {};

        for (const p of products) {
            const key = p.normalized;

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(p);
        }

        const deals = [];

        // ✅ compute deals per group (NOT per product scan)
        for (const key in groups) {
            const group = groups[key];

            if (group.length < 3) continue;

            const prices = group
                .map(p => p.price)
                .filter(Boolean);

            if (!prices.length) continue;

            const avg =
                prices.reduce((a, b) => a + b, 0) / prices.length;

            for (const product of group) {
                const price = product.price;

                const score = (avg - price) / avg;

                if (price <= avg * 0.85) {
                    deals.push({
                        product,
                        avg,
                        price,
                        savings: avg - price,
                        score
                    });
                }
            }
        }

        // ✅ rank + limit
        deals.sort((a, b) => b.score - a.score);
        const topDeals = deals.slice(0, 30);

        // ✅ cache result
        cachedDeals = topDeals;
        lastUpdated = Date.now();

        res.json(topDeals);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load deals' });
    }
});

module.exports = router;