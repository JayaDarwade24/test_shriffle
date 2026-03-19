import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({
      _id: payload.sub,
      deletedAt: null
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'User not found or deleted'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Admin role required'
    });
  }
  next();
};

