import mongoose ,{ Schema } from 'mongoose';
import { ICategory } from '../interfaces/category';

export const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum:{
            values: ['income', 'expense'],
            message: '{VALUE} is not supported'
        },
        lowercase: true,
        trim : true
    },
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);