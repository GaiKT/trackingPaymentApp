import express from 'express';
import { Transaction } from '../models/transaction';
import { User } from '../models/users';
import { Category } from '../models/category';
import { protect } from '../middlewares/protectRouters';

export const transactionRouter = express.Router();

// Protect all routes
transactionRouter.use(protect);

// Create a new transaction
transactionRouter.post('/', async (req, res) => {
    try {
        const { 
            name , 
            amount, 
            date,
            description , 
            userId , 
            categoryId } = req.body;
    
        // Validate required fields
        if (!amount || !name || !date || !userId || !categoryId) {

            const requiredFields = [];
            if (!amount) requiredFields.push('amount');
            if (!name) requiredFields.push('name');
            if (!date) requiredFields.push('date');
            if (!userId) requiredFields.push('userId');
            if (!categoryId) requiredFields.push('categoryId');

            return res.status(400).json({ 
                success: false,
                message: `${requiredFields.join(', ')} is required`
            });
        }

        // check if user not exists
        const thisUser = await User.findById(userId);
        if (!thisUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // check if category not exists
        const thisCategory = await Category.findById(categoryId);
        if (!thisCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // check type of transaction
        if (thisCategory.type === 'income' && amount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Income category cannot have negative amount'
            });
        }
        
        //update user balance
        if( thisCategory.type === 'income') {
            thisUser.balance += amount;
        }else{
            // check balance in user account
            if (thisUser.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
            }
            thisUser.balance -= amount
        }
        
        // Create new transaction
        const newTransaction = new Transaction({
            name,
            amount,
            description,
            date,
            user: thisUser,
            category: thisCategory
        });
        
        const savedTransaction = await newTransaction.save();
        await thisUser.save();
    
        res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: savedTransaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message
        });
    }
});

// Get all transactions
// Get all transactions for a specific user
transactionRouter.get('/', async (req, res) => {
    try {
        const userId = req.user?._id;

        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        const user = (await User.findById(userId));
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find transactions belonging to this user
        // Using populate to get detailed category information
        const transactions = await Transaction.find({ 'user._id': userId })
            .populate({
                path: 'category',
                select: 'name type icon color'
            })
            .sort({ date: -1 }); // Sort by date, newest first

        // Calculate summary statistics
        const totalIncome = transactions.reduce((acc, transaction) => {
            if (transaction.category && transaction.category.type === 'income') {
                return acc + transaction.amount;
            }
            return acc;
        }, 0);

        const totalExpense = transactions.reduce((acc, transaction) => {
            if (transaction.category && transaction.category.type === 'expense') {
                return acc + transaction.amount;
            }
            return acc;
        }, 0);

        // Return the transactions and summary data
        res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully',
            data: {
                transactions,
                totalIncome,
                totalExpense,
                totalBalance: user.balance
            }
        });
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions',
            error: error.message
        });
    }
});

// Get a single transaction
transactionRouter.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Transaction retrieved successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transaction',
            error: error.message
        });
    }
});

// Update a transaction
transactionRouter.put('/:id', async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: updatedTransaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction',
            error: error.message
        });
    }
});