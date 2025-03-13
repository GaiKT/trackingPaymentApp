import mongoose ,{ Schema} from "mongoose";
import { IUser } from "../interfaces/users";
import { ProfileSchema } from "./profile";

export const UserSchema = new Schema({

    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
    profile: ProfileSchema,

}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);