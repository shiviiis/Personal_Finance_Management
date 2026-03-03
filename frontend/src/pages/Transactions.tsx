import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Sidebar from '../components/layout/Sidebar';
import { toast } from 'react-toastify';
import './Transactions.css';

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    customCategory: '',
    type: 'Expense',
    date: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Determine final category (use custom if "Add new category" selected)
    const finalCategory = formData.category === 'custom' ? formData.customCategory : formData.category;

    if (!finalCategory) {
      toast.error('Please enter a category');
      setLoading(false);
      return;
    }

    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction._id}`, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: finalCategory,
          type: formData.type,
          date: formData.date,
        });
        toast.success('Transaction updated successfully');
      } else {
        await api.post('/api/transactions', {
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: finalCategory,
          type: formData.type,
          date: formData.date,
        });
        toast.success('Transaction added successfully');
      }

      setIsModalOpen(false);
      setFormData({ name: '', amount: '', category: '', customCategory: '', type: 'Expense', date: '' });
      setEditingTransaction(null);
      setShowCustomCategory(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to save transaction');
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/api/transactions/${id}`);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const predefinedCategories = ['Food', 'Rent', 'Bills'];
    const isCustomCategory = !predefinedCategories.includes(transaction.category);
    
    setFormData({
      name: transaction.name,
      amount: transaction.amount.toString(),
      category: isCustomCategory ? 'custom' : transaction.category,
      customCategory: isCustomCategory ? transaction.category : '',
      type: transaction.type || 'Expense',
      date: transaction.date.split('T')[0],
    });
    setShowCustomCategory(isCustomCategory);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData({ name: '', amount: '', category: '', customCategory: '', type: 'Expense', date: new Date().toISOString().split('T')[0] });
    setShowCustomCategory(false);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="transactions-header">
          <div>
            <h1>Transactions</h1>
            <p>Manage your income and expenses</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={20} /> Add Transaction
          </Button>
        </div>

        <Card>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found</p>
              <Button onClick={openAddModal}>Add Your First Transaction</Button>
            </div>
          ) : (
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.name}</td>
                      <td><span className="category-badge">{transaction.category}</span></td>
                      <td><span className={`type-badge ${transaction.type?.toLowerCase()}`}>{transaction.type || 'Expense'}</span></td>
                      <td className={`amount ${transaction.type?.toLowerCase() === 'income' ? 'income' : 'expense'}`}>
                        {transaction.type?.toLowerCase() === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td>
                        <div className="actions">
                          <button onClick={() => handleEdit(transaction)} className="action-btn edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(transaction._id)} className="action-btn delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
            setShowCustomCategory(false);
          }}
          title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        >
          <form onSubmit={handleSubmit} className="transaction-form">
            <Input
              label="Transaction Name"
              placeholder="e.g., Grocery Shopping"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <Input
              type="number"
              label="Amount"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, category: value, customCategory: '' });
                  setShowCustomCategory(value === 'custom');
                }}
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Bills">Bills</option>
                <option value="custom">Add new category</option>
              </select>
            </div>

            {showCustomCategory && (
              <Input
                label="Custom Category"
                placeholder="Enter category name"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                required
              />
            )}

            <Input
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Button type="submit" loading={loading} fullWidth>
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default Transactions;
