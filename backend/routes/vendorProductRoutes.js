const express = require("express");
const Product = require("../models/Product");
const categories = require("../data2/categories");
const vendorAuth = require("../middleware/vendorAuth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // preserve extension
    },
});

const upload = multer({ storage });

// --- Routes ---

// Note: Serving static files from /uploads should be done in your main app.js, e.g.:
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST /api/vendor/items/create (create product with image)
router.post("/create", vendorAuth, upload.single("image"), async (req, res) => {
    try {
        let { name, description, price, category } = req.body;

        // Trim inputs
        name = name?.trim();
        description = description?.trim();
        category = category?.trim();

        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!categories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        price = parseFloat(price);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            vendor: req.user._id,
            image: `/uploads/${req.file.filename}`, // relative URL/path to image
        });

        await product.save();

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET products by category (public route)
router.get("/category/:categoryName", async (req, res) => {
    try {
        const category = req.params.categoryName.trim();
        if (!categories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const products = await Product.find({ category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



/* router.get('/verify', vendorAuth, (req, res) => {
    // If vendorAuth passes, req.user is a valid vendor
    res.json({ id: req.user._id, role: req.user.role, email: req.user.email });
});
 */

// GET product by ID (vendor-only)
router.get("/:id", vendorAuth, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// PUT update product by ID (vendor-only, optional image upload)
router.put("/:id", vendorAuth, upload.single("image"), async (req, res) => {
    try {
        let { name, description, price, category } = req.body;

        // Trim inputs if provided
        if (name) name = name.trim();
        if (description) description = description.trim();
        if (category) category = category.trim();

        if (category && !categories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const updateData = {};

        if (name) updateData.name = name;
        if (description) updateData.description = description;

        if (price !== undefined) {
            price = parseFloat(price);
            if (isNaN(price) || price <= 0) {
                return res.status(400).json({ message: "Price must be a positive number" });
            }
            updateData.price = price;
        }

        if (category) updateData.category = category;

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user._id },
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        res.json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
