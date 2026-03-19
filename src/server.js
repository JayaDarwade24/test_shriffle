import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import { userRouter } from './users/user.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { errorHandler } from './shared/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

