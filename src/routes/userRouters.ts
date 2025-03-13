import express from 'express';
import { User } from '../models/users';
import bcrypt from 'bcrypt';

export const userRouter = express.Router();

// Create a new user
userRouter.post('/', async (req, res) => {
    try {
      const { username, email, password, profile } = req.body;
  
      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Username, email, and password are required' 
        });
      }

      // check if user already exists
      const existingUser = await User.findOne({ email, username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user with profile
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        profile: profile ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          nickName: profile.nickName,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined
        } : undefined
      });
  
      const savedUser = await newUser.save();
  
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: savedUser
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
});

// Get all users
userRouter.get('/', async (req, res) => {
    try {
      const users = await User.find();
  
      res.status(200).json({
        success: true,
        data: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          profile: user.profile
        }))
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
});

// Get a users
userRouter.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          profile: user.profile
        }
      });

    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
});

// delete a user
userRouter.delete('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
});
