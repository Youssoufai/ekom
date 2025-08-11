const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['product', 'service'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
