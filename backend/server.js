const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const userRoutes = require('./routes/user');
const vendorRoutes = require('./routes/vendor');
const categoryRoutes = require('./routes/categoryRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendor/items', vendorProductRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Connected to DB & listening on port ${PORT}`);
        });
    })
    .catch((err) => console.error('❌ DB connection error:', err));
