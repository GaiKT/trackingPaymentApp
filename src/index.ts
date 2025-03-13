import { mongooseConnection } from './db/mongooseConnection';
import { createServer } from './utils/server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;

const app = createServer();

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