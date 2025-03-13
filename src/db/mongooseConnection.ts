import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Export the URI so it can be overridden in tests
export const MONGO_URI = process.env.MONGO_URI || '';

// Track connection state
let isConnected = false;

export const mongooseConnection = async (uri?: string): Promise<void> => {
  try {
    // Skip if already connected
    if (isConnected) {
      console.log('MongoDB is already connected');
      return;
    }
    
    // Use provided URI or default
    const connectionUri = uri || MONGO_URI;
    
    if (!connectionUri) {
      throw new Error('MongoDB URI is not defined');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionUri);
    
    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    isConnected = false;
    throw error; // Throw instead of exiting for better testability
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    isConnected = false;
  });
  
  // Handle disconnection
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    isConnected = false;
  });
};

// Add a disconnect function for tests
export const disconnectMongoDB = async (): Promise<void> => {
  if (!isConnected) return;
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};