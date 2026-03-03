import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
              <h2 className="stat-value">${totalIncome.toFixed(2)}</h2>
            </div>
          </Card>

          <Card className="stat-card expense-card">
            <div className="stat-icon">
              <TrendingDown size={32} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Expenses</p>
              <h2 className="stat-value">${totalExpense.toFixed(2)}</h2>
            </div>
          </Card>

          <Card className="stat-card savings-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Net Savings</p>
              <h2 className="stat-value">${savings.toFixed(2)}</h2>
            </div>
          </Card>
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
