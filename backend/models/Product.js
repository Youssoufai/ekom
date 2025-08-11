const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // ✅ Added description
    price: { type: Number, required: true },
    category: { type: String, required: true }, // ✅ Added category
    image: { type: String },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    deleted: { type: Boolean, default: false }, // ✅ Soft delete field
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
