const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const categories = require("../data2/categories");
const vendorAuth = require("../middleware/vendorAuth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

/**
 * @route POST /api/vendor/items/create
 * @desc Create product with image
 */
router.post("/create", vendorAuth, upload.single("image"), async (req, res) => {
    try {
        let { name, description, price, category } = req.body;

        name = name?.trim();
        description = description?.trim();
        category = category?.trim();

        const matchedCategory = categories.find(
            c => c.toLowerCase() === category?.toLowerCase()
        );
        if (!matchedCategory) {
            return res.status(400).json({ message: "Invalid category" });
        }

        if (!name || !description || !price) {
            return res.status(400).json({ message: "All fields are required" });
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
            category: matchedCategory,
            vendor: req.user._id,
            image: `/uploads/${req.file.filename}`,
            deleted: false,
        });

        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route GET /api/vendor/items/category/:categoryName
 * @desc Get products by category (excluding deleted)
 */
router.get("/category/:categoryName", async (req, res) => {
    try {
        const requestedCategory = req.params.categoryName.trim();
        const matchedCategory = categories.find(
            c => c.toLowerCase() === requestedCategory.toLowerCase()
        );

        if (!matchedCategory) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const products = await Product.find({ category: matchedCategory, deleted: false });
        res.json(products);
    } catch (error) {
        console.error("Get category products error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route GET /api/vendor/items/:id
 * @desc Get a single product (vendor-only)
 */
router.get("/:id", vendorAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("Get single product error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route PUT /api/vendor/items/:id
 * @desc Update a product (vendor-only, optional image)
 */
router.put("/:id", vendorAuth, upload.single("image"), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        let { name, description, price, category } = req.body;

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
        if (req.file) updateData.image = `/uploads/${req.file.filename}`;

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
        console.error("Update product error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


/**
 * @route PATCH /api/vendor/items/:id/toggle-delete
 * @desc Delete or restore a product (vendor-only)
 */
router.patch("/:id/toggle-delete", vendorAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!product.vendor || product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        product.deleted = !product.deleted;
        await product.save();

        res.json({
            message: `Product ${product.deleted ? "deleted" : "restored"} successfully`,
            product,
        });
    } catch (error) {
        console.error("Toggle-delete error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


module.exports = router;
