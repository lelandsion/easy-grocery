const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

let cachedDeals = null;
let lastUpdated = 0;
const CACHE_TTL = 5 * 60 * 1000;

const normalize = (s) =>
    (s || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

router.get('/', async (req, res) => {
    try {
        if (cachedDeals && Date.now() - lastUpdated < CACHE_TTL) {
            return res.json(cachedDeals);
        }

        const rawProducts = await Product.find(
            {
                price: { $type: "number", $gt: 0.25, $lt: 100 },
                name: { $exists: true, $ne: "" }
            },
            {
                name: 1,
                price: 1,
                image_url: 1,
                quantity: 1,
                store: 1
            }
        ).lean();

        const groups = {};

        for (const p of rawProducts) {
            const price = Number(p.price);

            if (!Number.isFinite(price) || price <= 0.25 || price >= 100) {
                continue;
            }

            const key = `${normalize(p.name)}|${normalize(p.quantity || '')}`;

            if (!groups[key]) groups[key] = [];

            groups[key].push({
                ...p,
                price
            });
        }

        const deals = [];

        for (const key in groups) {
            const group = groups[key];

            if (group.length < 2) continue;

            const prices = group.map(p => p.price);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

            for (const product of group) {
                const savings = avg - product.price;
                const score = savings / avg;

                if (
                    product.price > 0 &&
                    avg > 0 &&
                    savings >= 0.5 &&
                    savings <= 50 &&
                    product.price <= avg * 0.85
                ) {
                    deals.push({
                        product,
                        avg,
                        price: product.price,
                        savings,
                        score
                    });
                }
            }
        }

        deals.sort((a, b) => b.score - a.score);

        cachedDeals = deals.slice(0, 30);
        lastUpdated = Date.now();

        res.json(cachedDeals);

    } catch (err) {
        console.error("Deals error:", err);
        res.status(500).json({ message: 'Failed to load deals' });
    }
});

module.exports = router;