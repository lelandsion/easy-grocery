
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true, // URL to store’s logo or image
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true, // City or general location of the store
    },
    categories: {
        type: [String],
        default: [], // Array of categories like ['Grocery', 'Electronics']
    },
    website: {
        type: String,
        required: false, // Optional URL to store’s website
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Store', storeSchema);