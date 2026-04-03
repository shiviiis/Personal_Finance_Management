# Bank Integration Feature

This document explains how to set up and use the bank integration feature powered by Plaid.

## Features

- **Connect Bank Accounts**: Securely connect bank accounts using Plaid Link
- **Auto-import Transactions**: Automatically import transactions from connected banks
- **Real-time Balance Updates**: View balances from all connected accounts in one dashboard
- **Multi-bank Support**: Connect multiple banks and view all accounts together
- **Transaction Sync**: Manually sync transactions or automatic updates via webhooks

## Prerequisites

1. **Plaid Account**: Sign up for a Plaid account at [plaid.com](https://plaid.com)
2. **API Keys**: Get your Client ID and Secret from the Plaid Dashboard
3. **Environment**: Choose Sandbox, Development, or Production environment

## Setup Instructions

### 1. Backend Configuration

#### Install Dependencies
```bash
cd backend
npm install plaid
```

#### Update Environment Variables
Add these to your `.env` file:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # Options: sandbox, development, production
PLAID_WEBHOOK_SECRET=your_webhook_secret
```

**Note**: For production, use `development` or `production` environment.

#### Database Models
The following models have been created:
- `BankConnection`: Stores Plaid connection details (access tokens, institution info)
- `BankAccount`: Stores bank account information and balances

These are automatically created when you run the application.

### 2. Frontend Configuration

#### Install Dependencies
```bash
cd frontend
npm install react-plaid-link
```

### 3. Database
No additional setup needed. The models will be created automatically when the application starts.

## How to Use

### For Development (Sandbox)

1. **Get Sandbox Credentials**:
   - Go to Plaid Dashboard → Teams → Sandbox
   - Copy your `client_id` and `secret`

2. **Configure Environment**:
   - Set `PLAID_ENV=sandbox` in backend `.env`
   - Add your sandbox credentials

3. **Use Sandbox Test Institutions**:
   - In Plaid Link, use these test credentials:
     - **Username**: `user_good`
     - **Password**: `pass_good`
   - Or use institution-specific test credentials from Plaid docs

### For Production

1. **Switch Environment**:
   - Set `PLAID_ENV=development` or `production`
   - Update credentials accordingly

2. **Configure Webhooks**:
   - Set `PLAID_WEBHOOK_SECRET` to verify webhook signatures
   - Update webhook URL in `createLinkToken` to your production domain

3. **Enable Products**:
   - Ensure your Plaid account has Transactions product enabled
   - Add other products (Balance, etc.) as needed

## API Endpoints

### Bank Routes (Protected - Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/banks/link/token/create` | Create Plaid Link token |
| POST | `/api/banks/link/token/exchange` | Exchange public token for access token |
| GET | `/api/banks/connections` | List all bank connections |
| GET | `/api/banks/accounts` | List all bank accounts with balances |
| GET | `/api/banks/dashboard/balances` | Get aggregated balance data for dashboard |
| GET | `/api/banks/sync/:connection_id?` | Sync transactions (all or specific connection) |
| DELETE | `/api/banks/disconnect/:connection_id` | Disconnect a bank |

### Webhook Endpoint (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/banks/webhook` | Plaid webhooks (transactions, item updates) |

## User Flow

1. **Connect a Bank**:
   - Navigate to `/banks` page
   - Click "Connect New Bank"
   - Complete Plaid Link flow
   - Bank accounts and recent transactions are automatically imported

2. **View Accounts**:
   - The "Accounts" section shows all connected accounts
   - See current balance, available balance, and institution info
   - Total balance across all banks is displayed

3. **Manage Connections**:
   - View list of connected banks
   - Manually sync transactions with the sync button
   - Disconnect banks when needed

4. **Dashboard Integration**:
   - The main dashboard shows total bank balance in the stats grid
   - Bank balance updates automatically when new transactions are imported

## Frontend Components

### BankConnect Component
- Located at: `frontend/src/components/bank/BankConnect.tsx`
- Handles Plaid Link initialization and token exchange
- Shows connection form with features and security info

### BankDashboard Component
- Located at: `frontend/src/components/bank/BankDashboard.tsx`
- Displays all connected bank accounts in a grid
- Shows balances, account types, and institution info
- Updates when new data is available

### Banks Page
- Located at: `frontend/src/pages/Banks.tsx`
- Main page for bank management
- Combines BankConnect, BankDashboard, and connection list
- Provides sync and disconnect actions

## Data Model

### BankConnection
```typescript
{
  user: ObjectId,           // Reference to User
  item_id: string,          // Plaid item ID
  access_token: string,     // Encrypted access token
  item_name: string,        // User's name for the connection
  institution_name: string, // Bank name
  institution_id: string,   // Plaid institution ID
  is_active: boolean,
  last_sync: Date
}
```

### BankAccount
```typescript
{
  user: ObjectId,           // Reference to User
  connection: ObjectId,     // Reference to BankConnection
  account_id: string,       // Plaid account ID
  name: string,             // Account name
  type: string,             // checking, savings, credit, etc.
  subtype: string,          // More specific type
  mask: string,             // Last 4 digits of account number
  current_balance: number,
  available_balance: number,
  iso_currency_code: string,
  is_active: boolean
}
```

### Transaction Metadata
Transactions imported from Plaid include additional metadata:
```typescript
{
  metadata: {
    plaid_transaction_id: string,
    plaid_account_id: string,
    bank_connection: ObjectId,
    pending: boolean
  }
}
```

## Security Considerations

1. **Access Tokens**: Stored encrypted in the database (consider using encryption-at-rest)
2. **Webhook Verification**: Implement proper webhook signature verification in production
3. **Token Refresh**: Plaid access tokens may need to be refreshed. Implement item swap if needed.
4. **Error Handling**: Connection failures are logged and handled gracefully

## Testing

1. Start the backend server on port 5000
2. Start the frontend on port 5173 (or 5174)
3. Navigate to `/banks` after logging in
4. Click "Connect Bank" and use Plaid sandbox credentials
5. Verify accounts and transactions appear
6. Check the dashboard for updated balances

## Troubleshooting

### "Failed to initialize bank connection"
- Check that Plaid credentials are correctly set in `.env`
- Verify `PLAID_ENV` matches your credentials
- Ensure backend server is running

### "Bank connection was cancelled or failed"
- This is normal if you close Plaid Link without completing
- Try again and complete the flow

### No accounts appear after connecting
- Check browser console for errors
- Verify `PLAID_WEBHOOK_SECRET` is set (even if empty in sandbox)
- Check backend logs for sync errors
- Manually click "Sync" on the connection

### Transactions not importing
- Check that Transactions product is enabled in your Plaid account
- Verify the date range (default: last 30 days)
- Check for duplicate transaction IDs in metadata

## Next Steps / Enhancements

1. **Category Mapping**: Improve automatic category mapping from Plaid categories
2. **Transaction Deduplication**: Enhance logic to avoid duplicate transactions
3. **Balance History**: Track balance changes over time
4. **Recurring Transactions**: Identify and categorize recurring transactions
5. **Notification System**: Alert users when new transactions are imported
6. **Export**: Add ability to export bank transactions to CSV/PDF
7. **Multiple Currencies**: Support for multi-currency accounts

## Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Link Documentation](https://plaid.com/docs/link/)
- [Transactions API](https://plaid.com/docs/api/transactions/)
- [Webhooks Guide](https://plaid.com/docs/webhooks/)
