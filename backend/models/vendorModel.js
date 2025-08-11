const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    storeName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'vendor'
    }
});


vendorSchema.statics.signup = async function (name, email, password, storeName) {
    if (!name || !email || !password || !storeName) {
        throw Error("All fields must be filled");
    }

    if (!validator.isEmail(email)) {
        throw Error('Email is not valid');
    }

    const exists = await this.findOne({ email });
    if (exists) {
        throw Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const vendor = await this.create({ name, email, password: hash, storeName });
    return vendor;
};

vendorSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error('All fields must be filled');
    }

    const vendor = await this.findOne({ email });
    if (!vendor) {
        throw Error("Incorrect email");
    }

    const match = await bcrypt.compare(password, vendor.password);
    if (!match) {
        throw Error('Incorrect password');
    }

    return vendor;
};

module.exports = mongoose.model('Vendor', vendorSchema);
