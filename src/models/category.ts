import mongoose ,{ Schema } from 'mongoose';
import { ICategory } from '../interfaces/category';

export const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
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
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
    description: {
        type: String
    }
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);