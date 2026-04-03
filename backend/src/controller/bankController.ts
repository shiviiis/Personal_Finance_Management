import { Request, Response, NextFunction } from "express";
import { yodleeService } from "../services/yodleeService";
import { BankConnection } from "../models/BankConnectionSchema";
import { BankAccount } from "../models/BankAccountSchema";
import { catchAsyncError } from "../middlewares/asyncerror";

export const getLinkToken = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const userSession = await yodleeService.createUserSession(userId.toString());
      const { fastLinkToken } = await yodleeService.generateFastLinkToken(userId.toString(), userSession);

      res.status(200).json({
        success: true,
        fastLinkToken,
        userSession,
      });
    } catch (error: any) {
      console.error("Error getting Yodlee link token:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to initialize bank connection",
      });
    }
  }
);

export const setAccessToken = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { accessToken, userSession } = req.body;
    if (!accessToken || !userSession) {
      res.status(400).json({ success: false, message: "Access token and user session are required" });
      return;
    }

    try {
      const callbackData = await yodleeService.processCallback(accessToken, userId.toString(), userSession);
      const providerAccounts = await yodleeService.getProviderAccounts(userId.toString(), userSession);

      const connections = [];

      for (const providerAccount of providerAccounts) {
        const providerAccountId = providerAccount.id.toString();

        const existingConnection = await BankConnection.findOne({
          user: userId,
          provider_account_id: providerAccountId,
        });

        if (!existingConnection) {
          const connection = new BankConnection({
            user: userId,
            provider_account_id: providerAccountId,
            provider_id: providerAccount.providerId.toString(),
            provider_name: providerAccount.providerName,
            nickname: providerAccount.nickname,
            is_active: providerAccount.status === 'ACTIVE',
            last_sync: new Date(),
            yodlee_user_session: userSession,
            status: providerAccount.status,
            connection_date: new Date(providerAccount.createdAt),
          });

          await connection.save();
          connections.push(connection);

          // Sync accounts and transactions
          await yodleeService.syncProviderAccount(providerAccountId, userSession, userId.toString());
        }
      }

      res.status(200).json({
        success: true,
        message: "Bank(s) connected successfully",
        connections: connections.length > 0 ? connections : providerAccounts.length,
      });
    } catch (error: any) {
      console.error("Error exchanging access token:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to connect bank",
      });
    }
  }
);

export const getConnections = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const connections = await BankConnection.find({ user: userId, is_active: true })
      .populate("user", "firstname lastname")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: connections.length,
      connections,
    });
  }
);

export const getAccounts = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const accounts = await BankAccount.find({ user: userId, is_active: true })
      .populate({
        path: "connection",
        select: "provider_name nickname",
      })
      .sort({ createdAt: -1 });

    const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

    res.status(200).json({
      success: true,
      count: accounts.length,
      total_balance: totalBalance,
      accounts,
    });
  }
);

export const disconnectBankAccount = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { connection_id } = req.params;
    if (!connection_id) {
      res.status(400).json({ success: false, message: "Connection ID is required" });
      return;
    }

    try {
      const connection = await BankConnection.findOne({
        _id: connection_id,
        user: userId,
      });

      if (!connection) {
        res.status(404).json({ success: false, message: "Bank connection not found" });
        return;
      }

      const userSession = connection.yodlee_user_session;
      if (!userSession) {
        res.status(400).json({ success: false, message: "User session not found. Please reconnect." });
        return;
      }

      await yodleeService.removeProviderAccount(connection.provider_account_id, userSession);

      connection.is_active = false;
      await connection.save();

      await BankAccount.updateMany(
        { connection: connection._id },
        { is_active: false }
      );

      res.status(200).json({
        success: true,
        message: "Bank disconnected successfully",
      });
    } catch (error: any) {
      console.error("Error disconnecting bank:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to disconnect bank",
      });
    }
  }
);

export const syncTransactions = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { connection_id } = req.params;
    let result;

    if (connection_id) {
      const connection = await BankConnection.findOne({
        _id: connection_id,
        user: userId,
        is_active: true,
      });

      if (!connection) {
        res.status(404).json({ success: false, message: "Bank connection not found" });
        return;
      }

      const userSession = connection.yodlee_user_session;
      if (!userSession) {
        res.status(400).json({ success: false, message: "User session expired. Please reconnect." });
        return;
      }

      result = await yodleeService.syncProviderAccount(connection.provider_account_id, userSession, userId.toString());
    } else {
      const connections = await BankConnection.find({ user: userId, is_active: true });
      const results = [];

      for (const connection of connections) {
        try {
          const userSession = connection.yodlee_user_session;
          if (!userSession) {
            results.push({
              connection: connection._id,
              success: false,
              error: 'User session expired. Please reconnect.',
            });
            continue;
          }

          const syncResult = await yodleeService.syncProviderAccount(
            connection.provider_account_id,
            userSession,
            userId.toString()
          );
          results.push({
            connection: connection._id,
            success: true,
            accounts_count: syncResult.accounts_count,
            transactions_count: syncResult.transactions_count,
          });
        } catch (error: any) {
          results.push({ connection: connection._id, success: false, error: error.message });
        }
      }

      result = { results };
    }

    res.status(200).json({
      success: true,
      message: "Transactions synced successfully",
      result,
    });
  }
);

export const getDashboardBalances = catchAsyncError(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const accounts = await BankAccount.find({ user: userId, is_active: true });

    const bankBalances: any = {};

    for (const account of accounts) {
      const connectionId = account.connection.toString();
      if (!bankBalances[connectionId]) {
        const conn = await BankConnection.findById(connectionId);
        bankBalances[connectionId] = {
          connection_id: connectionId,
          institution: conn?.provider_name || "Unknown",
          total_balance: 0,
          accounts: [],
        };
      }

      bankBalances[connectionId].total_balance += account.balance || 0;
      bankBalances[connectionId].accounts.push({
        account_id: account.account_id,
        name: account.name,
        type: account.type,
        current_balance: account.balance,
        available_balance: account.available_balance,
      });
    }

    const overallTotal = Object.values(bankBalances).reduce(
      (sum: number, bank: any) => sum + bank.total_balance,
      0
    );

    res.status(200).json({
      success: true,
      total_balance: overallTotal,
      banks: Object.values(bankBalances),
      accounts_count: accounts.length,
    });
  }
);

export const yodleeWebhook = async (req: Request, res: Response) => {
  try {
    const { eventType, ...payload } = req.body;

    console.log("Yodlee webhook received:", eventType, payload);

    switch (eventType) {
      case 'TRANSACTION_ADDED':
      case 'TRANSACTION_UPDATED':
        const providerAccountId = payload.providerAccountId;
        if (providerAccountId) {
          const connection = await BankConnection.findOne({
            provider_account_id: providerAccountId,
            is_active: true,
          });
          if (connection) {
            const userSession = connection.yodlee_user_session;
            if (userSession) {
              yodleeService.syncProviderAccount(providerAccountId, userSession, connection.user.toString())
                .then(() => console.log("Webhook sync completed for", providerAccountId))
                .catch((error) => console.error("Webhook sync error:", error));
            }
          }
        }
        break;

      case 'PROVIDER_ACCOUNT_ADD':
        console.log("New provider account added:", payload.providerAccountId);
        break;

      case 'PROVIDER_ACCOUNT_REMOVE':
        console.log("Provider account removed:", payload.providerAccountId);
        break;

      default:
        console.log("Unhandled Yodlee webhook:", eventType);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
