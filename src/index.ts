import express from 'express';
import { mongooseConnection } from './db/mongooseConnection';
import  { userRouter }  from './routes/userRouters';
import { categoryRouter } from './routes/categoryRouter';
import { transactionRouter } from './routes/transactionRouter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRouter);
app.use( '/category', categoryRouter);
app.use('/transaction', transactionRouter);

// Connect to MongoDB first, then start the server
mongooseConnection()
  .then(() => {
    // Start the server after successful database connection
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch(err => console.error('Failed to connect to the database', err));

app.get('/', (req, res) => {
  res.send('node is running');
});