// controllers/vendorController.js
const jwt = require('jsonwebtoken');
const vendorModel = require('../models/vendorModel');

const createToken = (id) => {
    // Token payload: { id, role }
    return jwt.sign({ id, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const loginVendor = async (req, res) => {
    const { email, password } = req.body;
    try {
        const vendor = await vendorModel.login(email, password);
        const token = createToken(vendor._id);

        // return vendor basic info + token
        res.status(200).json({
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                storeName: vendor.storeName
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const signupVendor = async (req, res) => {
    const { name, email, password, storeName } = req.body;
    try {
        const vendor = await vendorModel.signup(name, email, password, storeName);
        const token = createToken(vendor._id);

        res.status(201).json({
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                storeName: vendor.storeName
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { signupVendor, loginVendor };
