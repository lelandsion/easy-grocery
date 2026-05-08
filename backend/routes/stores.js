const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// Endpoint to get all stores
router.get('/', async (req, res) => {
    try {
        const stores = await Store.find();  // Fetch all stores from the database
        res.json(stores);
        console.log('Stores retrieved from MongoDB:', stores)
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Failed to retrieve stores' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        console.log('Single store:', store);
        res.json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
});


module.exports = router;