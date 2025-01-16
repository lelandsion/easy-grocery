// routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Authentication middleware
const User = require('../models/User');
const Store = require("../models/Store");

// Get user profile with populated favorites and shoppingLists
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('favorites') // Populate favorites with Product details
            .populate('shoppingLists.items'); // Populate shopping list items with Product details

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

router.get('/lists', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('shoppingLists.items');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.shoppingLists);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch shopping lists' });
    }
});

// Create a new shopping list
router.post('/lists', auth, async (req, res) => {
    const { name, items } = req.body; // Items should be an array of product IDs
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.shoppingLists.push({ name, items });
        await user.save();
        res.status(201).json({ message: 'Shopping list created', lists: user.shoppingLists });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create shopping list' });
    }
});

// Update an existing shopping list
router.put('/lists/:listId', auth, async (req, res) => {
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