import { Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    type: CategoryType;
}

type CategoryType = 'income' | 'expense';