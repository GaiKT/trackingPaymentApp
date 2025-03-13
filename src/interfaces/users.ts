import { Document } from 'mongoose';
import { IProfile } from './profile';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    balance: number;
    profile: IProfile;
    createdAt: Date;
    updatedAt: Date;
}