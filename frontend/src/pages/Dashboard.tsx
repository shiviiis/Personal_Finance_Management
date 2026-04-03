import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Sidebar from '../components/layout/Sidebar';
import './Dashboard.css';

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface BankBalance {
  total_balance: number;
  accounts_count: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankBalance, setBankBalance] = useState<BankBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch transactions
      const transactionsResponse = await api.get('/api/transactions');
      setTransactions(transactionsResponse.data.transactions || []);

      // Fetch bank balances
      try {
        const balanceResponse = await api.get('/api/banks/dashboard/balances');
        if (balanceResponse.data.success) {
          setBankBalance({
            total_balance: balanceResponse.data.total_balance,
            accounts_count: balanceResponse.data.accounts_count,
          });
        }
      } catch (bankError) {
        // Bank endpoints might not be configured yet, so we'll just skip
        console.log('Bank balances not available (expected in initial setup)');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.category.toLowerCase() === 'income' || t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.category.toLowerCase() !== 'income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your financial overview</p>
        </div>

        <div className="stats-grid">
          <Card className="stat-card income-card">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Income</p>
              <h2 className="stat-value">{formatCurrency(totalIncome)}</h2>
            </div>
          </Card>

          <Card className="stat-card expense-card">
            <div className="stat-icon">
              <TrendingDown size={32} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Expenses</p>
              <h2 className="stat-value">{formatCurrency(totalExpense)}</h2>
            </div>
          </Card>

          <Card className="stat-card savings-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Net Savings</p>
              <h2 className="stat-value">{formatCurrency(savings)}</h2>
            </div>
          </Card>

          {bankBalance && (
            <Card className="stat-card bank-card">
              <div className="stat-icon">
                <Wallet size={32} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Bank Balance</p>
                <h2 className="stat-value">{formatCurrency(bankBalance.total_balance)}</h2>
                <p className="stat-sublabel">{bankBalance.accounts_count} accounts</p>
              </div>
            </Card>
          )}
        </div>

        <Card className="recent-transactions">
          <h3>Recent Transactions</h3>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <div className="transactions-list">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div>
                    <p className="transaction-name">{transaction.name}</p>
                    <p className="transaction-category">{transaction.category}</p>
                  </div>
                  <div className="transaction-amount">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
