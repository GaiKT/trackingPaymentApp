import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import { Category } from '../models/category';
import { createServer } from '../utils/server';

describe('Category Router', () => {
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
    await Category.deleteMany({});
  });

  // First, let's test if the test setup is working 
  // by simply creating a category directly with the model
  it('should be able to create a category with the Category model', async () => {
    const testCategory = new Category({
      name: 'testdirectmodel',
      type: 'expense',
    });
    
    const savedCategory = await testCategory.save();
    expect(savedCategory._id).toBeDefined();
    console.log('Successfully created category with ID:', savedCategory._id);
  });

    // Now test the API endpoint
    it('should create a category through API', async () => {
        const categoryData = {
            name: 'testcategory',
            type: 'expense',
        };
        
        const response = await supertest(app)
            .post('/category')
            .send(categoryData);
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBeDefined();
        console.log('Successfully created category with ID:', response.body.data._id);
    });

    // Get all categories
    it('should get all categories through API', async () => {
        const response = await supertest(app)
            .get('/category');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        console.log('Retrieved categories:', response.body.data);
    });

    // Test getting non-existent category
    it('should return 404 for non-existent category', async () => {
        const categoryId = new mongoose.Types.ObjectId().toString();
        
        const response = await supertest(app)
            .get(`/category/${categoryId}`);
        
        expect(response.status).toBe(404);
        console.log('Get category response:', response.status, response.body);
    });

    // edit a category
    it('should edit a category through API', async () => {
        const categoryData = {
            name: 'testcategory',
            type: 'expense',
        };
        
        const response = await supertest(app)
            .post('/category')
            .send(categoryData);
        
        const updatedCategoryData = {
            name: 'updatedcategory',
            type: 'income',
        };
        
        const updatedResponse = await supertest(app)
            .put(`/category/${response.body.data._id}`)
            .send(updatedCategoryData);
        
        expect(updatedResponse.status).toBe(200);
        expect(updatedResponse.body.success).toBe(true);
        expect(updatedResponse.body.data.name).toBe(updatedCategoryData.name);
        console.log('Updated category:', updatedResponse.body.data);
    });

});