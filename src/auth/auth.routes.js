import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '1h';

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'email and password are required'
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    deletedAt: null
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password'
    });
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.status(200).json({
    token,
    user: user.toJSON()
  });
});

export { router as authRouter };

