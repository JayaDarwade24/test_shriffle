import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      error: 'DUPLICATE_KEY',
      message: `${field} must be unique`
    });
  }

  console.error(err);
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
};

