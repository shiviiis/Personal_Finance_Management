import React, { useEffect, useState } from 'react';
import { PieChart, BarChart, TrendingUp, TrendingDown } from 'lucide-react';
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

const Analysis: React.FC = () => {
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

  // Calculate category-wise expenses
  const categoryExpenses = transactions
    .filter(t => t.category.toLowerCase() !== 'income')
    .reduce((acc: { [key: string]: number }, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

  // Calculate monthly trends
  const monthlyData = transactions.reduce((acc: { [key: string]: { income: number; expense: number } }, transaction) => {
    const month = new Date(transaction.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (transaction.category.toLowerCase() === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expense += transaction.amount;
    }
    return acc;
  }, {});

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Financial Analysis</h1>
          <p>Deep insights into your spending patterns</p>
        </div>

        {loading ? (
          <p>Loading analysis...</p>
        ) : (
          <>
            {/* Category Breakdown */}
            <Card>
              <h3 className="card-title">
                <PieChart size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Spending by Category
              </h3>
              <div className="category-chart">
                {Object.entries(categoryExpenses).map(([category, amount]) => {
                  const total = Object.values(categoryExpenses).reduce((a, b) => a + b, 0);
                  const percentage = ((amount / total) * 100).toFixed(1);
                  return (
                    <div key={category} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category}</span>
                        <span className="category-amount">${amount.toFixed(2)}</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="category-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Monthly Trends */}
            <Card style={{ marginTop: 'var(--spacing-xl)' }}>
              <h3 className="card-title">
                <BarChart size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Monthly Trends
              </h3>
              <div className="monthly-trends">
                {Object.entries(monthlyData).map(([month, data]) => (
                  <div key={month} className="month-card">
                    <h4>{month}</h4>
                    <div className="month-stats">
                      <div className="stat-item income">
                        <TrendingUp size={20} />
                        <div>
                          <p>Income</p>
                          <p className="stat-value">${data.income.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="stat-item expense">
                        <TrendingDown size={20} />
                        <div>
                          <p>Expense</p>
                          <p className="stat-value">${data.expense.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Analysis;
