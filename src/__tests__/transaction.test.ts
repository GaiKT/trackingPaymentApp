import mongoose from "mongoose";
import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Transaction } from "../models/transaction";
import { User } from "../models/users";
import { Category } from "../models/category";
import { createServer } from "../utils/server";

describe("Transaction Router", () => {
  let mongoServer: MongoMemoryServer;
  let app = createServer();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("Connected to in-memory database");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log("MongoDB memory server stopped");
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
  });

  it("should be able to create a transaction with the Transaction model", async () => {
    
    const testUser = new User({
      username: "testuser",
      email: "testemail@gmail.com",
      password: "testpassword",
      profile : {
        firstName: "test",
        lastName: "user",
        nickName: "testuser",
        dateOfBirth: new Date('1990-01-01'),
      }
    });
    
    const savedUser = await testUser.save();

    const testCategory = new Category({
      name: "testcategory",
      type: "income",
    });

    const savedCategory = await testCategory.save();
    
    const testTransaction = new Transaction({
      name: "testtransaction",
      amount: 100,
      description: "testtransaction",
      user: savedUser,
      category: savedCategory,
    });

    const savedTransaction = await testTransaction.save();
    expect(savedTransaction._id).toBeDefined();
  });
});