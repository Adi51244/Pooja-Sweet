import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pooja-sweets-secret-change-in-production';
const TOKEN_EXPIRY = '30d';

export function signToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }
  try {
    req.admin = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
}

export function getSettings() {
  return db.prepare('SELECT admin_phone, shop_name FROM admin_settings WHERE id = 1').get();
}

export { JWT_SECRET };
