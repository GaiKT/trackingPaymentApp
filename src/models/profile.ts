import { Schema } from 'mongoose';

export const ProfileSchema = new Schema({

    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    nickName: { 
        type: String, 
        required: true 
    },
    dateOfBirth: { 
        type: Date, 
        required: true 
    },

}, { timestamps: true });