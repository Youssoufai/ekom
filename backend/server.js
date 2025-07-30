// server.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const cors = require('cors'); // ✅ ADD THIS

require('dotenv').config();

const app = express();

// ✅ ADD THIS LINE TO ALLOW CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Connected to db & listening on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.log(err));
