import { Document } from 'mongoose';

export interface IProfile extends Document {
    firstName: string;
    lastName: string;
    nickName: string;
    dateOfBirth: Date;
}