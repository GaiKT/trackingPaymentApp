import express from 'express';
import { Transaction } from '../models/transaction';
import { User } from '../models/users';
import { Category } from '../models/category';

export const transactionRouter = express.Router();

// Create a new transaction
transactionRouter.post('/', async (req, res) => {
    try {
        const { 
            name , 
            amount, 
            description , 
            userId , 
            categoryId } = req.body;
    
        // Validate required fields
        if (!amount || !name) {
            return res.status(400).json({ 
                success: false,
                message: 'Amount and Transaction name are required' 
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
        await thisUser.save();
        
        // Create new transaction
        const newTransaction = new Transaction({
            name,
            amount,
            description,
            user: thisUser,
            category: thisCategory
        });
    
        const savedTransaction = await newTransaction.save();
    
        res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: {
            name: savedTransaction.name,
            amount: savedTransaction.amount,
            description: savedTransaction.description,
            user: {
                id: thisUser._id,
                username: thisUser.username,
                email: thisUser.email,
                balance: thisUser.balance
            },
        }
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
transactionRouter.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully',
            data: transactions
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