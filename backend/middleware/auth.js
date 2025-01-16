// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user info from token to request
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = auth;