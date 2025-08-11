// controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const createToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id, user.role);

        res.status(200).json({
            user: { id: user._id, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const signupUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.signup(email, password);
        const token = createToken(user._id, user.role);

        res.status(201).json({
            user: { id: user._id, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { signupUser, loginUser };
