# Bank Integration with Yodlee

The Personal Finance Management application now supports bank account integration using **Yodlee's REST API**, enabling automatic transaction imports and real-time balance updates.

## Features

✅ **Connect to banks via Yodlee API** - Support for 15,000+ financial institutions  
✅ **Auto-import transactions** - Automatically sync transactions from connected accounts  
✅ **Real-time balance updates** - View aggregated balances across all banks  
✅ **Multi-bank dashboard** - See all accounts in one unified view  
✅ **Secure FastLink** - Yodlee's secure bank authentication flow  
✅ **Webhook support** - Real-time updates when transactions change  

## Prerequisites

1. **Yodlee Developer Account**: Sign up at [Yodlee Developer Portal](https://developer.yodlee.com/)
2. **API Credentials**: Obtain Cobrand Login and Cobrand Password
3. **Environment**: Sandbox for development, Production for live deployment

## Setup Instructions

### 1. Backend Configuration

#### Install Dependencies
Already installed:
- `axios` - HTTP client for Yodlee API
- `uuid` - For generating random passwords

#### Configure Environment Variables

Update your `backend/.env` file:

```env
# Yodlee Configuration
YODLEE_COBRAND_LOGIN=your_cobrand_login
YODLEE_COBRAND_PASSWORD=your_cobrand_password
YODLEE_ENV=sandbox

# Sandbox URL
YODLEE_BASE_URL=https://developer.api.yodlee.com/ysl/restapi/v1

# Development/Production URL
# YODLEE_BASE_URL=https://api.yodlee.com/ysl/restapi/v1

YODLEE_REDIRECT_URI=http://localhost:5174/banks
```

**Important**: The `YODLEE_REDIRECT_URI` should point to your frontend banks page where Yodlee will redirect after authentication.

#### Database Models

Two models are used to store Yodlee data:

**BankConnection** (`backend/src/models/BankConnectionSchema.ts`):
- Stores connection details for each bank/institution
- Tracks Yodlee provider account ID, sessions, and sync status

**BankAccount** (`backend/src/models/BankAccountSchema.ts`):
- Stores individual account details (balance, type, status)
- Links to BankConnection

### 2. Frontend Configuration

The frontend component `BankConnect` automatically loads Yodlee FastLink SDK from CDN.

## How It Works

### Authentication Flow

1. **Initialize Cobrand Session**: App authenticates with Yodlee using cobrand credentials
2. **Create User Session**: Each user gets a unique Yodlee user session (auto-created or reused)
3. **Generate FastLink Token**: Backend generates FastLink token for secure bank connection
4. **Open FastLink UI**: Frontend opens Yodlee's bank selection interface
5. **User Authenticates**: User enters bank credentials in Yodlee's secure iframe
6. **Access Token Received**: Yodlee returns access token to the app
7. **Sync Data**: Automatically fetch accounts and transactions

### Data Sync Process

When a bank is connected:

1. **Provider Accounts**: Store bank connection details
2. **Accounts**: Fetch all accounts (checking, savings, credit, etc.)
3. **Transactions**: Import last 30 days of transactions
4. **Categorization**: Map Yodlee categories to app's category system
5. **Database**: Save all data to MongoDB

Transactions are checked for duplicates using Yodlee's transaction ID.

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/banks/link/token/create` | Create FastLink token and user session |
| POST | `/api/banks/link/token/exchange` | Exchange access token and sync data |

### Data Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/banks/connections` | List all active bank connections |
| GET | `/api/banks/accounts` | List all bank accounts with balances |
| GET | `/api/banks/dashboard/balances` | Get aggregated balance data |
| GET | `/api/banks/sync/:connection_id?` | Sync transactions (all or specific) |
| DELETE | `/api/banks/disconnect/:connection_id` | Disconnect a bank |

### Webhook

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/banks/webhook` | Yodlee webhooks (transactions, account updates) |

**Note**: The webhook endpoint is public (no authentication) as Yodlee needs to access it directly.

## Yodlee Sandbox Testing

### Get Sandbox Credentials

1. Login to [Yodlee Developer Portal](https://developer.yodlee.com/)
2. Go to **Teams** → **Sandbox**
3. Copy your **Cobrand Login** and **Cobrand Password**

### Configure for Sandbox

In `.env`:
```env
YODLEE_ENV=sandbox
YODLEE_BASE_URL=https://developer.api.yodlee.com/ysl/restapi/v1
YODLEE_COBRAND_LOGIN=your_sandbox_cobrand_login
YODLEE_COBRAND_PASSWORD=your_sandbox_cobrand_password
```

### Test Institutions

In Yodlee Sandbox, you can use these test credentials:

**Bank**: `101` (Test Bank)
- Username: `test_user`
- Password: `test_password`

Some institutions support OAuth, others require credentials.

### Webhook Configuration

To test webhooks in sandbox, configure the webhook URL in your Yodlee developer settings to point to:
```
https://your-domain.com/api/banks/webhook
```

For local development, use ngrok to expose your localhost:
```bash
ngrok http 5000
```
Then set webhook URL to: `https://your-ngrok-url.ngrok.io/api/banks/webhook`

## Production Deployment

### 1. Upgrade Yodlee Account

- Contact Yodlee to upgrade from Sandbox to Production
- Obtain production cobrand credentials
- Update `YODLEE_BASE_URL` to `https://api.yodlee.com/ysl/restapi/v1`

### 2. Environment Configuration

```env
YODLEE_ENV=production
YODLEE_BASE_URL=https://api.yodlee.com/ysl/restapi/v1
YODLEE_COBRAND_LOGIN=your_prod_cobrand_login
YODLEE_COBRAND_PASSWORD=your_prod_cobrand_password
YODLEE_REDIRECT_URI=https://your-app.com/banks
```

### 3. Webhook Setup

1. Configure webhook URL in Yodlee Production dashboard
2. Implement proper webhook signature verification (currently simplified)
3. Ensure endpoint is HTTPS and publicly accessible

### 4. Security Considerations

- Store Yodlee credentials securely in environment variables
- Consider encrypting access tokens at rest
- Implement webhook signature verification
- Use HTTPS for all communications
- Set up proper error logging and monitoring

## User Experience

### Connecting a Bank

1. User navigates to `/banks` page (must be logged in)
2. Clicks "Connect Bank" button
3. Yodlee FastLink opens in a popup
4. User searches/selects their bank
5. User authenticates with bank credentials (via Yodlee secure iframe)
6. On success, popup closes and accounts appear automatically
7. Initial transaction sync begins

### Dashboard

- All connected accounts displayed with balances
- Total balance across all banks shown
- Account details: type, last 4 digits, current balance
- Color-coded by institution

### Managing Connections

- View list of connected banks
- Manually sync transactions with refresh button
- Disconnect banks (removes from Yodlee and local DB)

## Troubleshooting

### "Failed to initialize bank connection"

**Check**:
- Yodlee credentials are correctly set in `.env`
- Backend server is running
- Network connectivity to Yodlee

### "Cobrand authentication failed"

**Check**:
- Cobrand login/password are correct
- Account is active in Yodlee developer portal
- `YODLEE_BASE_URL` matches your environment (sandbox vs production)

### "No accounts appear after connecting"

**Check**:
- Bank login succeeded in FastLink
- Webhook URL is configured (for automatic updates)
- Manually click sync button
- Check browser console and backend logs

### "User session expired"

**Solution**: Users need to reconnect their bank. This happens when:
- Yodlee session expires (typically after 30 minutes of inactivity)
- Access token is invalidated by the bank
- Implement automatic reconnection flow if needed

### Transactions not importing

**Check**:
- Transactions product is enabled in Yodlee
- Date range is sufficient (default: last 30 days)
- Bank supports transaction data retrieval
- No duplicate transactions (checked by Yodlee transaction ID)

## Data Models

### BankConnection Schema

```typescript
{
  user: ObjectId,              // User reference
  provider_account_id: String, // Yodlee provider account ID
  provider_id: String,         // Institution ID
  provider_name: String,       // Bank name (e.g., "Chase")
  nickname: String,            // User's nickname
  is_active: Boolean,
  last_sync: Date,
  yodlee_user_session: String, // Yodlee user session
  status: String,              // ACTIVE, INACTIVE, DELETED
  connection_date: Date
}
```

### BankAccount Schema

```typescript
{
  user: ObjectId,              // User reference
  connection: ObjectId,        // BankConnection reference
  account_id: String,          // Yodlee account ID
  name: String,                // Account name
  display_name: String,        // Display name from bank
  account_identifier: String,  // Masked account number
  type: String,                // checking, savings, credit, etc.
  subtype: String,             // More specific type
  status: String,              // ACTIVE, INACTIVE, DELETED
  balance: Number,             // Current balance
  available_balance: Number,   // Available balance (if applicable)
  currency: String,            // Currency code (default USD)
  is_manual: Boolean,          // Manual account flag
  last_sync: Date,
  is_active: Boolean
}
```

### Transaction Metadata

Transactions from Yodlee include:

```typescript
{
  metadata: {
    yodlee_transaction_id: Number,  // Yodlee's transaction ID
    yodlee_account_id: Number,      // Yodlee account ID
    bank_connection: ObjectId,      // BankConnection reference
    pending: Boolean                // Is transaction pending?
  }
}
```

## Rate Limits and Quotas

Yodlee has rate limits that vary by plan:
- Sandbox: Higher limits for testing
- Production: Varies by subscription tier

If you hit rate limits:
- Implement exponential backoff in sync operations
- Space out sync requests
- Contact Yodlee for higher limits

## Support and Resources

- [Yodlee API Documentation](https://developer.yodlee.com/api-guide/)
- [Yodlee FastLink Guide](https://developer.yodlee.com/docs/api/fastlink/)
- [Yodlee Error Codes](https://developer.yodlee.com/api-guide/error-codes/)
- [Yodlee Developer Support](https://developer.yodlee.com/support/)

## Next Steps

1. Set up Yodlee developer account
2. Add credentials to `.env`
3. Test connection in sandbox
4. Configure webhooks for real-time updates
5. Deploy to production with production credentials
