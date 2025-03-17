import express from 'express';
import { User } from '../models/users';
import { protect } from '../middlewares/protectRouters';

export const userRouter = express.Router();
// Protect all routes
// userRouter.use(protect);

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
