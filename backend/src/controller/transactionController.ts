import { Request, Response, NextFunction } from "express";
import { Transaction } from "../models/TransSchema";
import { catchAsyncError } from "../middlewares/asyncerror";
import Category from "../models/CategorySchema";
import { Document } from "mongoose";
import { AuthRequest } from "../types/authRequest";
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

interface ITransaction extends Document {
  user: string;
  amount: number;
  category: string;
  date: Date;
  type: "income" | "expense";
  name: string;
}


export const addTransaction = catchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user){
        res.status(401).json({success:false,message:"Unauthorized"});
        return;
      }
      const { name, amount, category, date, type } = req.body;
      const newTransaction = new Transaction({
        user: req.user._id,
        amount,
        category,
        date,
        type,
        name
      });

      await newTransaction.save();

      res.status(201).json({
        success: true,
        message: "Transaction added successfully",
        transaction: newTransaction,
      }); 
});


export const getTransactions = catchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user){
      res.status(401).json({success:false,message:"Unauthorized"});
      return;
    }
    const transactions = await Transaction.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  }
);


export const updateTransaction = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updatedData = req.body;

    const transaction = await Transaction.findByIdAndUpdate(id, updatedData, { new: true });
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  }
);


export const deleteTransaction = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }
    await transaction.deleteOne();
    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
});


// generateSummaryChartData
// generateCategoryWiseExpenseChartData
// generateTransactionPDF