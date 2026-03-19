import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  softDeleteUser
} from './user.controller.js';
import { authMiddleware, requireAdmin } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', createUser);

router.use(authMiddleware);

router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', requireAdmin, softDeleteUser);

export { router as userRouter };

