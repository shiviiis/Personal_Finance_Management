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
    },
    type:{
        type: String,
        enum: ["income", "expense"],
        default: "expense"
    },
    metadata:{
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

export const Transaction=mongoose.model('Transaction',TransSchema);
