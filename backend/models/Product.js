const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    currency: String,
    price_unit: String,
    size_text: String,
    category: String,
    aisle: String,
    image_url: String,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    description: String,
    quantity: String,

}, { collection: 'products', timestamps: true });

module.exports = mongoose.model('Product', productSchema);

