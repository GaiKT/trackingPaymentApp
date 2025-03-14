import express from 'express';
import { userRouter } from '../routes/userRouters';
import { categoryRouter } from '../routes/categoryRouter';
import { transactionRouter } from '../routes/transactionRouter';
import { authRouter } from '../routes/authRouter';

export const createServer = (): express.Express => {
  
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Routes
  app.use('/users', userRouter);
  app.use('/category', categoryRouter);
  app.use('/transaction', transactionRouter);
  app.use('/auth', authRouter);
  
  return app;
};