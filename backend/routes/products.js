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

router.get('/', async (req, res) => {
    const { category, minPrice, maxPrice, sortBy, page = 1, limit = 70 } = req.query;
    const filter = {};
    // Apply filters based on query params
    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = { $gte: minPrice || 0, $lte: maxPrice || Infinity };

    try {
        const products = await Product.find(filter)
            .sort(sortBy ? { [sortBy]: 1 } : {}) // Example sort (1 for ascending)
            .skip((page - 1) * limit)            // Pagination
            .limit(Number(limit));// Retrieves all documents in the 'products' collection

        console.log('Products retrieved from MongoDB:', products); // Log products to console
        res.json(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: 'Failed to retrieve products' });
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