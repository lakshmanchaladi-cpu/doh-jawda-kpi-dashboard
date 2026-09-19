const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-change-in-production';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // For local development, accept any credentials
  if (process.env.NODE_ENV !== 'production' || (username === 'admin' && password === 'admin')) {
    const token = jwt.sign({ id: 'local', role: 'admin', username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: 'local', role: 'admin', username } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    res.json({ valid: true, user });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;