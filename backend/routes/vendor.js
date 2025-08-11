const express = require('express');
const { signupVendor, loginVendor } = require('../controllers/vendorController');
const vendorAuth = require('../middleware/vendorAuth');

const router = express.Router();

// Signup route
router.post('/register', signupVendor);

// Login route
router.post('/login', loginVendor);

// Verify token route
router.get('/verify', vendorAuth, (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
    });
});

module.exports = router;
