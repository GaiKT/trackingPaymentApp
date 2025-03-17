import express from 'express';
import { userRouter } from '../routes/userRouters';
import { categoryRouter } from '../routes/categoryRouter';
import { transactionRouter } from '../routes/transactionRouter';
import { authRouter } from '../routes/authRouter';
import { exportRouter } from '../routes/exportRouter';
import cors from "cors";

export const createServer = (): express.Express => {
  
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  
  // Routes
  app.use('/users', userRouter);
  app.use('/category', categoryRouter);
  app.use('/transaction', transactionRouter);
  app.use('/auth', authRouter);
  app.use('/export', exportRouter);
  
  return app;
};