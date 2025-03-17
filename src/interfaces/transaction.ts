import { Document } from 'mongoose';
import { ICategory } from './category';
import { IUser } from './users';

export interface ITransaction extends Document {
    user: IUser;
    category: ICategory;
    name: string;
    amount: number;
    date: Date;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}