import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { runAsync, getAsync } from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const existing = await getAsync('SELECT * FROM users WHERE email = ?', [value.email]);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(value.password, 10);
    const role = value.role || 'user';
    const result = await runAsync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [value.name, value.email, hashed, role]
    );
    const user = await getAsync('SELECT id, name, email, role FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await getAsync('SELECT * FROM users WHERE email = ?', [value.email]);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(value.password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const payloadUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payloadUser, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payloadUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
