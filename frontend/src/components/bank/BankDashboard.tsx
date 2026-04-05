import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import './BankDashboard.css';

interface BankAccount {
  _id: string;
  account_id: string;
  name: string;
  type: string;
  subtype?: string;
  account_identifier?: string;
  balance: number;
  available_balance?: number;
  connection: {
    provider_name: string;
    nickname?: string;
  };
}

interface BankDashboardProps {
  refreshTrigger?: number;
}

const BankDashboard: React.FC<BankDashboardProps> = ({ refreshTrigger = 0 }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/banks/accounts');
      if (response.data.success) {
        setAccounts(response.data.accounts);
        setTotalBalance(response.data.total_balance || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
      case 'creditcard':
        return '💳';
      case 'loan':
        return '📉';
      case 'investment':
        return '📈';
      default:
        return '💵';
    }
  };

  const getInstitutionColors = (institution: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
    ];
    const index = institution.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="bank-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bank-dashboard-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchAccounts} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bank-dashboard-empty">
        <div className="empty-icon">🏦</div>
        <h3>No Bank Accounts Connected</h3>
        <p>Connect your bank to see all your accounts in one place</p>
      </div>
    );
  }

  return (
    <div className="bank-dashboard">
      <div className="total-balance-card">
        <div className="total-balance-info">
          <h3>Total Balance</h3>
          <div className="total-amount">{formatCurrency(totalBalance)}</div>
          <div className="account-count">{accounts.length} accounts</div>
        </div>
        <div className="trend-indicator positive">
          <TrendingUp size={24} />
          <span>Across {new Set(accounts.map(a => a.connection.provider_name)).size} banks</span>
        </div>
      </div>

      <div className="accounts-grid">
        {accounts.map((account) => (
          <div key={account._id} className="account-card">
            <div className="account-header">
              <div className="institution-info">
                <div className={`institution-logo bg-gradient-to-r ${getInstitutionColors(account.connection.provider_name)}`}>
                  {getAccountTypeIcon(account.type)}
                </div>
                <div className="institution-details">
                  <div className="institution-name">{account.connection.provider_name}</div>
                  <div className="account-type">{account.type} {account.subtype && `(${account.subtype})`}</div>
                </div>
              </div>
              <div className="account-mask">
                {account.account_identifier ? `•••• ${account.account_identifier}` : 'N/A'}
              </div>
            </div>

            <div className="account-body">
              <div className="account-name">{account.name}</div>
              <div className="balance-section">
                <div className="balance-item">
                  <span className="label">Current Balance</span>
                  <span className="value">{formatCurrency(account.balance)}</span>
                </div>
                {account.available_balance !== undefined && (
                  <div className="balance-item">
                    <span className="label">Available</span>
                    <span className="value">{formatCurrency(account.available_balance)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="account-footer">
              <div className="status-indicator active"></div>
              <span>Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankDashboard;
