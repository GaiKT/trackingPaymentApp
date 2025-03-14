import { mongooseConnect } from './db/mongooseConnection';
import { createServer } from './utils/server';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;

const app = createServer();

mongooseConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch(err => console.error('Failed to connect to the database', err));
  
app.get('/', (req, res) => {
  res.send('Hello World');
});
