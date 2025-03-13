import express from 'express';
import { userRouter } from '../routes/userRouters';
import { categoryRouter } from '../routes/categoryRouter';
import { transactionRouter } from '../routes/transactionRouter';

export function createServer() {
    const app = express();
    app.use(express.json());
    app.use('/users', userRouter);
    app.use( '/category', categoryRouter);
    app.use('/transaction', transactionRouter);

    return app;
}