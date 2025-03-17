import express from 'express';
import { Category } from '../models/category';
import { protect } from '../middlewares/protectRouters';

export const categoryRouter = express.Router();

// Protect all routes
// categoryRouter.use(protect);

// cerate a new category
categoryRouter.post('/', async (req, res) => {
    try {
        const { name, type , icon , color , description } = req.body;

        // Validate required fields
        if (!name || !type) {
            const requiredFields = [];
            if (!name) requiredFields.push('name');
            if (!type) requiredFields.push('type');
            if (!icon) requiredFields.push('icon');
            if (!color) requiredFields.push('color');

            return res.status(400).json({
                success: false,
                message: `${requiredFields.join(', ')} is required`
            });
        }

        // check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Create new category
        const newCategory = new Category({
            name,
            type,
            icon,
            color,
            description
        });

        const savedCategory = await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
});

// Get all categories
categoryRouter.get('/', async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get categories',
            error: error.message
        });
    }
});

// edit a category
categoryRouter.put('/:id', async (req, res) => {
    try {
        const { name, type } = req.body;

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, and type are required'
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
            name,
            type
        }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
});

// delete a category
categoryRouter.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
});
