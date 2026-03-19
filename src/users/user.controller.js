import { User } from './user.model.js';
import { ApiError } from '../shared/ApiError.js';

export const createUser = async (req, res) => {
  const { name, email, password, role, isActive } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'name, email and password are required');
  }
  if (name.length < 3) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'name must be at least 3 characters');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'USER',
    isActive: isActive !== undefined ? isActive : true
  });

  return res.status(201).json(user.toJSON());
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, deletedAt: null });

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  return res.status(200).json(user.toJSON());
};

export const getAllUsers = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const { role, isActive } = req.query;

  const filter = { deletedAt: null };

  if (role) filter.role = role;
  if (isActive !== undefined) {
    if (isActive === 'true' || isActive === true) filter.isActive = true;
    if (isActive === 'false' || isActive === false) filter.isActive = false;
  }

  const [items, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);

  return res.status(200).json({
    data: items.map((u) => u.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, isActive } = req.body || {};
  const currentUser = req.user;

  if (currentUser.role !== 'ADMIN' && currentUser._id.toString() !== id) {
    throw new ApiError(403, 'FORBIDDEN', 'You can update only your own profile');
  }

  const user = await User.findOne({ _id: id, deletedAt: null }).select('+password');

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  if (name !== undefined) {
    if (name.length < 3) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'name must be at least 3 characters');
    }
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  if (role !== undefined) {
    if (currentUser.role !== 'ADMIN') {
      throw new ApiError(403, 'FORBIDDEN', 'Only ADMIN can change role');
    }
    user.role = role;
  }

  if (password !== undefined) {
    user.password = password;
  }

  await user.save();

  return res.status(200).json(user.toJSON());
};

export const softDeleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, deletedAt: null });

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  user.deletedAt = new Date();
  await user.save();

  return res.status(204).send();
};

