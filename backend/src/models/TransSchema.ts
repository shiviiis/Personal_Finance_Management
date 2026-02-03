import mongoose from "mongoose";

const TransSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    category:{
        type : String,
        required: true,
    },
    amount:{
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    name:{
        type:String,
        required:true
    }
});

export const Transaction=mongoose.model('Transaction',TransSchema);
