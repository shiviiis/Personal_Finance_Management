import React, { useState } from 'react';
import { Plus, CreditCard, Wallet, Building, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Sidebar from '../components/layout/Sidebar';
import './Dashboard.css';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
  icon: any;
}

const Accounts: React.FC = () => {
  const [accounts] = useState<Account[]>([
    { id: '1', name: 'Main Checking', type: 'checking', balance: 5420.50, currency: 'USD', icon: Building },
    { id: '2', name: 'Savings Account', type: 'savings', balance: 12500.00, currency: 'USD', icon: TrendingUp },
    { id: '3', name: 'Credit Card', type: 'credit', balance: -850.30, currency: 'USD', icon: CreditCard },
    { id: '4', name: 'Cash', type: 'cash', balance: 250.00, currency: 'USD', icon: Wallet },
  ]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'var(--color-primary)';
      case 'savings': return '#06b6d4';
      case 'credit': return '#f59e0b';
      case 'cash': return 'var(--color-secondary)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Accounts</h1>
            <p>Manage all your financial accounts</p>
          </div>
          <Button>
            <Plus size={20} /> Add Account
          </Button>
        </div>

        {/* Total Balance Card */}
        <Card className="total-balance-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
            Total Net Worth
          </p>
          <h2 style={{ fontSize: '3rem', margin: 0, color: totalBalance >= 0 ? 'var(--color-primary)' : '#ef4444' }}>
            ${Math.abs(totalBalance).toFixed(2)}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
            Across {accounts.length} accounts
          </p>
        </Card>

        {/* Accounts Grid */}
        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <Card key={account.id} className="account-card glass-hover" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: `linear-gradient(135deg, ${getAccountColor(account.type)}, ${getAccountColor(account.type)}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{account.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {account.type}
                    </p>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                    Balance
                  </p>
                  <p style={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    margin: 0,
                    color: account.balance >= 0 ? 'var(--color-text-primary)' : '#ef4444'
                  }}>
                    {account.balance < 0 && '-'}${Math.abs(account.balance).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                    {account.currency}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Accounts;
