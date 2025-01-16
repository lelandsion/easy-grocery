const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    image_url: String,
    description: String,
    quantity: String,
}, { collection: 'products', timestamps: true });

module.exports = mongoose.model('Product', productSchema);

