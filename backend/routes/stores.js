const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

let storesCache = null;
let storesCacheTime = 0;
const STORES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const singleStoreCache = new Map();

// Endpoint to get all stores
router.get('/', async (req, res) => {
    const start = Date.now();

    try {
        if (storesCache && Date.now() - storesCacheTime < STORES_CACHE_TTL) {
            res.set('X-Stores-Cache', 'HIT');
            res.set('Cache-Control', 'public, max-age=300');
            return res.json(storesCache);
        }

        const stores = await Store.find()
            .select('name description logo websiteUrl')
            .lean();

        storesCache = stores;
        storesCacheTime = Date.now();

        res.set('X-Stores-Cache', 'MISS');
        res.set('Cache-Control', 'public, max-age=300');

        console.log(`Stores fetched: ${stores.length} stores in ${Date.now() - start}ms`);

        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Failed to retrieve stores' });
    }
});

router.get('/:id', async (req, res) => {
    const start = Date.now();

    try {
        const cached = singleStoreCache.get(req.params.id);

        if (cached && Date.now() - cached.time < STORES_CACHE_TTL) {
            res.set('X-Store-Cache', 'HIT');
            res.set('Cache-Control', 'public, max-age=300');
            return res.json(cached.data);
        }

        const store = await Store.findById(req.params.id)
            .select('name description logo websiteUrl')
            .lean();

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        singleStoreCache.set(req.params.id, {
            time: Date.now(),
            data: store
        });

        res.set('X-Store-Cache', 'MISS');
        res.set('Cache-Control', 'public, max-age=300');

        console.log(`Single store fetched in ${Date.now() - start}ms`);

        res.json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
});


module.exports = router;