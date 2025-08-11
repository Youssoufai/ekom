// middleware/requireAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
    try {
        const header = req.header('Authorization') || req.headers.authorization;
        if (!header) return res.status(401).json({ error: 'Authorization token required' });

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) return res.status(401).json({ error: 'Invalid token' });

        // Attach minimal user info (you can extend as needed)
        const user = await User.findById(decoded.id).select('_id email role');
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        console.error('requireAuth error:', err);
        return res.status(401).json({ error: 'Request is not authorized', details: err.message });
    }
};
