import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import { User } from '../models/users';
import { createServer } from '../utils/server';

describe('User Router', () => {
  let mongoServer: MongoMemoryServer;
  let app: express.Express = createServer();

  // Setup in-memory MongoDB database
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('Test MongoDB URI:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory database');
  });

  // Close the in-memory database and stop the server
  afterAll(async () => {
    console.log('Cleaning up test environment...');
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('MongoDB memory server stopped');
  });

  // Clean up collections between tests
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // First, let's test if the test setup is working 
  // by simply creating a user directly with the model
  it('should be able to create a user with the User model', async () => {
    const testUser = new User({
      username: 'testdirectmodel',
      email: 'direct@example.com',
      password: 'password123'
    });
    
    const savedUser = await testUser.save();
    expect(savedUser._id).toBeDefined();
    console.log('Successfully created user with ID:', savedUser._id);
  });

  // Now test the API endpoint
  it('should create a user through API', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await supertest(app)
      .post('/users')
      .send(userData);
    
    console.log('API Response:', response.status, response.body);
    
    expect(response.status).toBe(201);
  });
  
  // Test getting non-existent user
  it('should return 404 for non-existent user', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    
    const response = await supertest(app)
      .get(`/users/${userId}`);
    
    console.log('Get user response:', response.status, response.body);
    
    expect(response.status).toBe(404);
  });
});