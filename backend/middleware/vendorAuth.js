const jwt = require('jsonwebtoken');
const Vendor = require('../models/vendorModel');

const vendorAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No token, authorization denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const vendor = await Vendor.findById(decoded.id);

        if (!vendor || vendor.role !== "vendor") {
            return res.status(403).json({ message: "Access denied. Vendor only" });
        }

        req.user = vendor; // attach vendor info to req.user
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = vendorAuth;
