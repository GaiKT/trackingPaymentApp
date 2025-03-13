import mongoose, {Schema} from "mongoose";
import { ITransaction } from "../interfaces/transaction";
import { categorySchema } from "./category";
import { UserSchema } from "./users";

const TransactionSchema = new Schema({
    user: UserSchema,
    category: categorySchema,
    name:{
        type: String,
        required: true
    } ,
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
}, { timestamps: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

