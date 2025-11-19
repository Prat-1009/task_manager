import express from 'express';
import { auth } from '../middleware/auth.js';
import { taskCreateSchema, taskUpdateSchema } from '../validators/task.js';
import { runAsync, getAsync, allAsync } from '../config/db.js';

const router = express.Router();

// Create
router.post('/', auth, async (req, res) => {
  const { value, error } = taskCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const result = await runAsync(
      'INSERT INTO tasks (title, description, status, createdBy) VALUES (?, ?, ?, ?)',
      [value.title, value.description || '', value.status || 'pending', req.user.id]
    );
    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const q = req.query.q;

    const where = [];
    const params = [];

    if (req.user.role !== 'admin') {
      where.push('createdBy = ?');
      params.push(req.user.id);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (q) {
      where.push('title LIKE ?');
      params.push(`%${q}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const items = await allAsync(
      `SELECT * FROM tasks ${whereClause} ORDER BY datetime(createdAt) DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const totalRow = await getAsync(`SELECT COUNT(*) as cnt FROM tasks ${whereClause}`, params);
    res.json({ items, total: totalRow?.cnt || 0, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get by id
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  const { value, error } = taskUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const next = { ...task, ...value };
    await runAsync(
      'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
      [next.title, next.description || '', next.status, req.params.id]
    );
    const updated = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete (admin can delete any, user only own)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await runAsync('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
