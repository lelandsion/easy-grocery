// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require("../models/Product");

router.post('/', async (req, res) => {
    try {
        // hard coded version for testing
        const product = new Product({
            name: "Test Product",
            price: "9.99",
            image_url: "https://example.com/image.jpg",
            quantity: "1 unit",
            category: "Test Category"
        });
        // const product = new Product(req.body);
        console.log('Attempting to save product:', product);
        const savedProduct = await product.save();
        console.log('Product saved successfully:', savedProduct);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to save product' });
    }
});

router.get('/store/:storeId/aisles', async (req, res) => {
    try {
        const aisles = await Product.distinct('aisle', {
            store: req.params.storeId
        });
        res.json(aisles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch aisles' });
    }
});

router.get('/store/:storeId', async (req, res) => {
    try {
        const products = await Product.find({
            store: req.params.storeId
        });
        res.json(products);
    } catch (err) {
        console.error('Error fetching store products:', err);
        res.status(500).json({ error: 'Failed to fetch store products' });
    }
});

router.get('/search', async (req, res) => {
    const query = req.query.q; // ?q=apple

    try {
        const products = await Product.find({
            name: { $regex: query, $options: 'i' } // case-insensitive search
        });
        res.json(products);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);

    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// **** test this ***
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(204).send(); // No content on success
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


module.exports = router;