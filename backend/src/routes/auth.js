import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js';
import { runAsync, getAsync } from '../config/db.js';
import crypto from 'crypto';

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

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { value, error } = forgotPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await getAsync('SELECT id, email FROM users WHERE email = ?', [value.email]);
    // Always respond 200 to avoid user enumeration
    if (!user) return res.json({ message: 'If this email exists, a reset link has been generated.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    await runAsync('INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)', [user.id, token, expiresAt]);

    // In production, email the token link instead of returning it.
    return res.json({ message: 'Reset token generated', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { value, error } = resetPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const row = await getAsync('SELECT * FROM password_resets WHERE token = ?', [value.token]);
    if (!row) return res.status(400).json({ message: 'Invalid or expired token' });
    const expired = new Date(row.expiresAt).getTime() < Date.now();
    if (expired) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(value.password, 10);
    await runAsync('UPDATE users SET password = ? WHERE id = ?', [hashed, row.userId]);
    await runAsync('DELETE FROM password_resets WHERE id = ?', [row.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
