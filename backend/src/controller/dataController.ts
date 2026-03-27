import { Request, Response, NextFunction } from "express";
import { Transaction } from "../models/TransSchema";
import { User } from "../models/UserSchema";
import { catchAsyncError } from "../middlewares/asyncerror";

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Export all user data
// @route   GET /api/data/export
// @access  Private
export const exportUserData = catchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user._id;

      // Fetch all transactions for the user
      const transactions = await Transaction.find({ user: userId }).lean();

      // Fetch user data (excluding sensitive fields)
      const userData = await User.findById(userId).select('-password').lean();

      // Create export object
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: {
          firstname: userData?.firstname,
          lastname: userData?.lastname,
          email: userData?.Email,
        },
        transactions: transactions,
        statistics: {
          totalTransactions: transactions.length,
          totalIncome: transactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + t.amount, 0),
          totalExpense: transactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + t.amount, 0),
        }
      };

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=finance-backup-${new Date().toISOString().split('T')[0]}.json`);

      res.status(200).json(exportData);
    } catch (error) {
      console.error('Export error:', error);
      throw error; // Let catchAsyncError handle it
    }
  }
);

// @desc    Import user data
// @route   POST /api/data/import
// @access  Private
export const importUserData = catchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user._id;
      const importData = req.body;

      // Validate import data structure
      if (!importData || !importData.transactions || !Array.isArray(importData.transactions)) {
        res.status(400).json({ message: 'Invalid import data format' });
        return;
      }

      // Validate version
      if (importData.version !== '1.0') {
        res.status(400).json({ 
          message: `Unsupported data version: ${importData.version}. Expected version 1.0` 
        });
        return;
      }

      // Optional: Clear existing data before import (if requested)
      const clearExisting = req.query.clear === 'true';
      if (clearExisting) {
        await Transaction.deleteMany({ user: userId });
      }

      // Prepare transactions for import
      const transactionsToImport = importData.transactions.map((transaction: any) => ({
        user: userId,
        category: transaction.category,
        amount: transaction.amount,
        date: new Date(transaction.date),
        name: transaction.name,
        type: transaction.type || 'expense', // Default to expense if not specified
      }));

      // Validate all transactions before importing
      const validationErrors = transactionsToImport.filter((t: any) => {
        return !t.category || !t.amount || !t.date || !t.name;
      });

      if (validationErrors.length > 0) {
        res.status(400).json({ 
          message: `${validationErrors.length} transactions have invalid data`,
          invalidCount: validationErrors.length
        });
        return;
      }

      // Insert transactions
      const importedTransactions = await Transaction.insertMany(transactionsToImport);

      res.status(200).json({
        message: 'Data imported successfully',
        importedCount: importedTransactions.length,
        statistics: {
          totalTransactions: importedTransactions.length,
          totalIncome: importedTransactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + t.amount, 0),
          totalExpense: importedTransactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + t.amount, 0),
        }
      });
    } catch (error: any) {
      console.error('Import error:', error);
      res.status(500).json({ 
        message: 'Failed to import data',
        error: error.message 
      });
      throw error; // Let catchAsyncError handle it
    }
  }
);

// @desc    Get import statistics (preview before importing)
// @route   POST /api/data/import/preview
// @access  Private
export const previewImportData = catchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const importData = req.body;

      if (!importData || !importData.transactions || !Array.isArray(importData.transactions)) {
        res.status(400).json({ message: 'Invalid import data format' });
        return;
      }

      const transactions = importData.transactions;
      
      const stats = {
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0),
        totalExpense: transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0),
        dateRange: {
          earliest: transactions.length > 0 
            ? new Date(Math.min(...transactions.map((t: any) => new Date(t.date).getTime())))
            : null,
          latest: transactions.length > 0
            ? new Date(Math.max(...transactions.map((t: any) => new Date(t.date).getTime())))
            : null,
        },
        categories: [...new Set(transactions.map((t: any) => t.category))]
      };

      res.status(200).json({
        message: 'Import preview generated',
        statistics: stats,
        sampleTransactions: transactions.slice(0, 5) // Show first 5 transactions
      });
    } catch (error) {
      console.error('Preview error:', error);
      throw error; // Let catchAsyncError handle it
    }
  }
);
