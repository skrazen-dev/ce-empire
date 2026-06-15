import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from './db';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });

  try {
    const { rows } = await pool.query('SELECT id, username, password_hash, display_name FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid' });

    // store user id in session
    (req as any).session.userId = user.id;
    return res.json({ user: user.username, displayName: user.display_name || user.username });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/logout', (req, res) => {
  (req as any).session.destroy((err: any) => {
    res.clearCookie(process.env.SESSION_COOKIE_NAME || 'sid');
    if (err) return res.status(500).end();
    return res.status(204).end();
  });
});

router.get('/me', async (req, res) => {
  const sid = (req as any).session;
  if (!sid || !sid.userId) return res.status(401).json({ error: 'unauth' });

  try {
    const { rows } = await pool.query('SELECT username, display_name FROM users WHERE id = $1', [sid.userId]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'unauth' });
    return res.json({ user: user.username, displayName: user.display_name || user.username });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;
