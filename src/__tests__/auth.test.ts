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
    const mongoUri = mongoServer.getUri('testDB');
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

    const mockUser = {
        username: 'testdirectmodel',
        email: 'testemail@gmail.com',
        password: 'password123',
        profile : {
            firstName: 'test',
            lastName: 'user',
            nickName: 'testuser',
            dateOfBirth: new Date('1990-01-01')
        }
    }

    it('should be able to create a user with the User model', async () => {
        const testUser = new User(mockUser);
        const savedUser = await testUser.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe('testdirectmodel');
        expect(savedUser.password).not.toBe('password123');
    });

    // Now test the API endpoint
    it('should create a user through API', async () => {
        const response = await supertest(app)
            .post('/auth/register')
            .send(mockUser);
        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.username).toBe('testdirectmodel');
        expect(response.body.password).not.toBe('password123');
    });

    it('should not create a user with the same email', async () => {
        const response = await supertest(app)
            .post('/auth/register')
            .send(mockUser);
        expect(response.status).toBe(400);
    });

    // test login
    it('should login a user', async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: mockUser.password });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    it('should not login a user with wrong password', async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: 'wrongpassword' });
        expect(response.status).toBe(401);
    });

});