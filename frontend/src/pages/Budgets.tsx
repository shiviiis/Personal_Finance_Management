import React, { useState } from 'react';
import { Plus, Target, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Sidebar from '../components/layout/Sidebar';
import './Dashboard.css';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

const Budgets: React.FC = () => {
  const [budgets] = useState<Budget[]>([
    { id: '1', category: 'Food & Dining', limit: 500, spent: 320 },
    { id: '2', category: 'Transportation', limit: 200, spent: 180 },
    { id: '3', category: 'Entertainment', limit: 150, spent: 95 },
    { id: '4', category: 'Shopping', limit: 300, spent: 420 },
  ]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return 'var(--color-primary)';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Budget Management</h1>
            <p>Track and manage your spending limits</p>
          </div>
          <Button>
            <Plus size={20} /> Create Budget
          </Button>
        </div>

        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const remaining = budget.limit - budget.spent;
            
            return (
              <Card key={budget.id} className="budget-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                  <h3>{budget.category}</h3>
                  {percentage >= 100 && <AlertCircle size={24} color="#ef4444" />}
                </div>
                
                <div className="budget-amounts">
                  <div>
                    <p className="budget-label">Spent</p>
                    <p className="budget-value">${budget.spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="budget-label">Limit</p>
                    <p className="budget-value">${budget.limit.toFixed(2)}</p>
                  </div>
                </div>

                <div className="budget-progress">
                  <div 
                    className="budget-progress-bar" 
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage)
                    }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {percentage.toFixed(1)}% used
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: remaining < 0 ? '#ef4444' : 'var(--color-text-muted)' 
                  }}>
                    {remaining < 0 ? 'Over by' : 'Remaining'}: ${Math.abs(remaining).toFixed(2)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Budgets;
