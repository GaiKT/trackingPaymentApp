import { Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    discription: string;
}

type CategoryType = 'income' | 'expense';