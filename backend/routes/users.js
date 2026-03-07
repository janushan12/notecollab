const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const users = await User.find({
            email: { $regex: q, $options: 'i' },
            _id: { $ne: req.user._id },
        }).select('name email').limit(5);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;