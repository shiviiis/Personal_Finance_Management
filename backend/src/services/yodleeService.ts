import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { BankConnection } from '../models/BankConnectionSchema';
import { BankAccount } from '../models/BankAccountSchema';
import { Transaction } from '../models/TransSchema';

interface YodleeConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  cobrandLogin?: string; // Fallback for older API
  cobrandPassword?: string; // Fallback for older API
  redirectUri?: string;
}

interface YodleeAccount {
  accountId: number;
  accountName: string;
  providerName: string;
  accountNumber?: string;
  accountType: string;
  accountTypeDetail?: string;
  accountStatus: string;
  currentBalance?: { amount: number; currencyCode?: string };
  availableBalance?: { amount: number; currencyCode?: string };
}

interface YodleeTransaction {
  transactionId: number;
  description?: { transactionHeader: { name: string } };
  transactionAmount?: { amount: number };
  transactionDate?: string;
  createdAt?: string;
  category?: any[];
  isPending?: boolean;
  accountId: number;
}

class YodleeService {
  private client: AxiosInstance;
  private config: YodleeConfig;
  private cobrandSession: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      baseUrl: process.env.YODLEE_BASE_URL || 'https://developer.api.yodlee.com/ysl/restapi/v1',
      clientId: process.env.YODLEE_CLIENT_ID || '',
      clientSecret: process.env.YODLEE_CLIENT_SECRET || '',
      cobrandLogin: process.env.YODLEE_COBRAND_LOGIN || '',
      cobrandPassword: process.env.YODLEE_COBRAND_PASSWORD || '',
      redirectUri: process.env.YODLEE_REDIRECT_URI || 'http://localhost:5174/banks',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Api-Version': '1.1',
      },
    });

    // Request interceptor to add access token
    this.client.interceptors.request.use(async (config) => {
      if (!this.accessToken) {
        await this.authenticate();
      }
      if (this.accessToken) {
        // New Yodlee API uses Authorization header with Bearer token
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  /**
   * Authenticate with Yodlee using modern OAuth2-style client credentials
   * Uses clientId/clientSecret if available, falls back to cobrand credentials
   */
  private async authenticate(): Promise<void> {
    try {
      // Try modern OAuth2-style authentication first (clientId/clientSecret)
      if (this.config.clientId && this.config.clientSecret) {
        const response = await this.client.post('/auth/token', {
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
        });

        this.accessToken = response.data.accessToken || response.data.access_token;
        if (this.accessToken) {
          console.log('Yodlee authenticated with client credentials (OAuth2)');
          return;
        }
      }

      // Fallback to legacy cobrand authentication
      if (this.config.cobrandLogin && this.config.cobrandPassword) {
        const response = await this.client.post('/cobrand/login', {
          cobrand: {
            cobrandLogin: this.config.cobrandLogin,
            cobrandPassword: this.config.cobrandPassword,
          },
        });

        this.cobrandSession = response.headers['cobrand-requestsessionid'] || response.data.session?.cobrandSession;
        if (!this.cobrandSession) {
          throw new Error('No cobrand session in response');
        }
        console.log('Yodlee authenticated with cobrand credentials (legacy)');
        return;
      }

      throw new Error('No valid Yodlee credentials configured');
    } catch (error: any) {
      console.error('Yodlee authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Yodlee');
    }
  }

  /**
   * Create a Yodlee user session for the application user
   */
  async createUserSession(userId: string): Promise<string> {
    try {
      // Check if user already exists in Yodlee
      const usersResponse = await this.client.get('/users', {
        params: {
          'loginName': `user_${userId}`,
        },
      });

      let userSession: string;

      if (usersResponse.data.user && usersResponse.data.user.length > 0) {
        // User exists, login
        const existingUser = usersResponse.data.user[0];
        const loginResponse = await this.client.post('/user/login', {
          user: {
            loginName: existingUser.loginName,
            password: existingUser.password,
          },
        });
        userSession = loginResponse.headers['authorization'] || loginResponse.data.user?.session?.userSession;
        if (!userSession) {
          throw new Error('No user session in login response');
        }
      } else {
        // Create new user
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const registerResponse = await this.client.post('/user/register', {
          user: {
            loginName: `user_${userId}`,
            password: randomPassword,
            email: `user_${userId}@example.com`,
            country: 'US',
          },
        });
        userSession = registerResponse.headers['authorization'] || registerResponse.data.user?.session?.userSession;
        if (!userSession) {
          throw new Error('No user session in registration response');
        }
      }

      return userSession;
    } catch (error: any) {
      console.error('User session creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create user session in Yodlee');
    }
  }

  /**
   * Generate FastLink token for bank connection UI
   */
  async generateFastLinkToken(userId: string, userSession: string): Promise<{ fastLinkToken: string; userSession: string }> {
    try {
      const response = await this.client.get('/fastlink', {
        headers: {
          'Authorization': userSession,
        },
        params: {
          'redirect_uri': this.config.redirectUri,
        },
      });

      const fastLinkToken = response.data.fastLinkToken;
      if (!fastLinkToken) {
        throw new Error('No fastLinkToken in response');
      }
      return { fastLinkToken, userSession };
    } catch (error: any) {
      console.error('FastLink token generation failed:', error.response?.data || error.message);
      throw new Error('Failed to generate FastLink token');
    }
  }

  /**
   * Process FastLink callback - get provider accounts
   */
  async processCallback(accessToken: string, userId: string, userSession: string): Promise<any> {
    try {
      const response = await this.client.get('/providerAccounts', {
        headers: {
          'Authorization': userSession,
        },
        params: {
          'accessToken': accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Callback processing failed:', error.response?.data || error.message);
      throw new Error('Failed to process bank connection callback');
    }
  }

  /**
   * Get all provider accounts for a user
   */
  async getProviderAccounts(userId: string, userSession: string): Promise<any[]> {
    try {
      const response = await this.client.get('/providerAccounts', {
        headers: {
          'Authorization': userSession,
        },
        params: {
          'providerAccountId.status': 'ACTIVE',
        },
      });

      return response.data.providerAccount || [];
    } catch (error: any) {
      console.error('Failed to fetch provider accounts:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get accounts for a provider account
   */
  async getAccounts(userId: string, userSession: string, providerAccountId?: string): Promise<YodleeAccount[]> {
    try {
      const params: any = {
        'account.status': 'ACTIVE',
      };

      if (providerAccountId) {
        params['providerAccountId'] = providerAccountId;
      }

      const response = await this.client.get('/accounts', {
        headers: {
          'Authorization': userSession,
        },
        params,
      });

      return response.data.account || [];
    } catch (error: any) {
      console.error('Failed to fetch accounts:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get transactions for a provider account
   */
  async getTransactions(userId: string, userSession: string, providerAccountId?: string, days: number = 30): Promise<YodleeTransaction[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const params: any = {
        'fromDate': startDate.toISOString().split('T')[0],
        'toDate': endDate.toISOString().split('T')[0],
        'transactionStatus': 'POSTED',
        'quantity': 500,
      };

      if (providerAccountId) {
        params['providerAccountId'] = providerAccountId;
      }

      const response = await this.client.get('/transactions', {
        headers: {
          'Authorization': userSession,
        },
        params,
      });

      return response.data.transaction || [];
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Remove/disable a provider account
   */
  async removeProviderAccount(providerAccountId: string, userSession: string): Promise<boolean> {
    try {
      await this.client.delete(`/providerAccounts/${providerAccountId}`, {
        headers: {
          'Authorization': userSession,
        },
      });
      return true;
    } catch (error: any) {
      console.error('Failed to remove provider account:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync all data for a provider account (accounts + transactions)
   */
  async syncProviderAccount(providerAccountId: string, userSession: string, userId: string): Promise<{ accounts_count: number; transactions_count: number }> {
    try {
      // Fetch accounts for this provider
      const accounts = await this.getAccounts(userId, userSession, providerAccountId);

      let transactionsCount = 0;

      for (const account of accounts) {
        const accountId = account.accountId.toString();
        const connection = await BankConnection.findOne({ provider_account_id: providerAccountId });

        if (!connection) {
          console.error(`Connection not found for provider account ${providerAccountId}`);
          continue;
        }

        // Save/update account
        await BankAccount.findOneAndUpdate(
          {
            user: userId,
            account_id: accountId,
          },
          {
            user: userId,
            connection: connection._id,
            account_id: accountId,
            name: account.accountName || account.providerName || 'Unknown Account',
            display_name: account.accountName,
            account_identifier: account.accountNumber,
            type: this.mapAccountType(account.accountType),
            subtype: account.accountTypeDetail,
            status: account.accountStatus,
            balance: account.currentBalance?.amount || 0,
            available_balance: account.availableBalance?.amount,
            currency: account.currentBalance?.currencyCode || 'USD',
            last_sync: new Date(),
            is_active: account.accountStatus === 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        // Fetch transactions for this account
        const transactions = await this.getTransactions(userId, userSession, providerAccountId);
        transactionsCount += transactions.length;

        for (const tx of transactions) {
          // Check if transaction already exists
          const existingTransaction = await Transaction.findOne({
            'metadata.yodlee_transaction_id': tx.transactionId,
          });

          if (!existingTransaction) {
            const category = this.mapYodleeCategory(tx.category || []);
            const amount = tx.transactionAmount?.amount || 0;
            const type = amount > 0 ? 'income' : 'expense';

            await new Transaction({
              user: userId,
              name: tx.description?.transactionHeader?.name || 'Unknown',
              amount: Math.abs(amount),
              date: new Date(tx.transactionDate || tx.createdAt || Date.now()),
              category: category,
              type: type,
              metadata: {
                yodlee_transaction_id: tx.transactionId,
                yodlee_account_id: tx.accountId,
                bank_connection: connection._id,
                pending: tx.isPending || false,
              },
            }).save();
          }
        }
      }

      return {
        accounts_count: accounts.length,
        transactions_count: transactionsCount,
      };
    } catch (error: any) {
      console.error('Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Map Yodlee account types to internal types
   */
  private mapAccountType(yodleeType: string): string {
    const mapping: { [key: string]: string } = {
      'CHECKING': 'checking',
      'SAVINGS': 'savings',
      'CREDIT_CARD': 'credit',
      'LOAN': 'loan',
      'MORTGAGE': 'mortgage',
      'INVESTMENT': 'investment',
      'CASH': 'cash',
    };
    return mapping[yodleeType.toUpperCase()] || yodleeType.toLowerCase();
  }

  /**
   * Map Yodlee categories to internal category names
   */
  private mapYodleeCategory(categories: any[]): string {
    if (!categories || categories.length === 0) return 'Other';

    const primary = categories[0];
    if (typeof primary === 'object' && primary.category) {
      return primary.category;
    }
    return primary.toString() || 'Other';
  }
}

export const yodleeService = new YodleeService();
export default yodleeService;
