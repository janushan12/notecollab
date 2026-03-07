const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const userRoutes = require('./routes/users');

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        })
    })
    .catch(err => {
        console.log('MongoDB connection error:', err.message);
        process.exit(1);
    });