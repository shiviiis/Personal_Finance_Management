import express from "express";
import {
  getLinkToken,
  setAccessToken,
  getConnections,
  getAccounts,
  disconnectBankAccount,
  syncTransactions,
  getDashboardBalances,
  yodleeWebhook,
} from "../controller/bankController";
import { isAuthorized } from "../middlewares/AuthMiddleware";

const router = express.Router();

// Protect all bank routes with authentication middleware
router.post("/link/token/create", isAuthorized as any, getLinkToken);
router.post("/link/token/exchange", isAuthorized as any, setAccessToken);
router.get("/connections", isAuthorized as any, getConnections);
router.get("/accounts", isAuthorized as any, getAccounts);
router.delete("/disconnect/:connection_id", isAuthorized as any, disconnectBankAccount);
router.get("/sync/:connection_id?", isAuthorized as any, syncTransactions);
router.get("/dashboard/balances", isAuthorized as any, getDashboardBalances);

// Webhook endpoint (no auth required - Yodlee sends the request)
router.post("/webhook", yodleeWebhook);

export default router;
