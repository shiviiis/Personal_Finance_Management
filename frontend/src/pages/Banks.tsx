import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Unlink, Building2, AlertCircle } from 'lucide-react';
import BankConnect from '../components/bank/BankConnect';
import BankDashboard from '../components/bank/BankDashboard';
import Sidebar from '../components/sidebar';
import api from '../utils/api';
import './Banks.css';

interface BankConnection {
  _id: string;
  provider_account_id: string;
  provider_name: string;
  nickname?: string;
  last_sync: string | null;
  created_at: string;
  status: string;
}

const Banks: React.FC = () => {
  const [showConnect, setShowConnect] = useState(false);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/banks/connections');
      if (response.data.success) {
        setConnections(response.data.connections);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSuccess = () => {
    setShowConnect(false);
    fetchConnections();
    setDashboardRefresh(prev => prev + 1);
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank? This will stop automatic transaction imports.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/api/banks/disconnect/${connectionId}`);
      if (response.data.success) {
        fetchConnections();
        setDashboardRefresh(prev => prev + 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect bank');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      setSyncing(connectionId);
      const response = await api.get(`/api/banks/sync/${connectionId}`);
      if (response.data.success) {
        setDashboardRefresh(prev => prev + 1);
        // Show success message
        alert('Transactions synced successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync transactions');
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/banks/sync');
      if (response.data.success) {
        setDashboardRefresh(prev => prev + 1);
        alert('All banks synced successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="banks-layout">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="banks-content">
        <div className="banks-header">
          <div className="header-left">
            <h1>Bank Connections</h1>
            <p>Connect and manage your bank accounts</p>
          </div>
          <div className="header-actions">
            {connections.length > 0 && (
              <button
                className="sync-all-btn"
                onClick={handleSyncAll}
                disabled={loading || syncing !== null}
              >
                <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                Sync All
              </button>
            )}
            <button
              className="connect-bank-btn"
              onClick={() => setShowConnect(!showConnect)}
            >
              <Plus size={16} />
              {showConnect ? 'Hide' : 'Connect New Bank'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {showConnect && (
          <div className="connect-section">
            <BankConnect onConnectionSuccess={handleConnectionSuccess} />
          </div>
        )}

        {/* Bank Dashboard showing accounts */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Accounts</h2>
            <button onClick={() => setDashboardRefresh(prev => prev + 1)} className="refresh-btn">
              <RefreshCw size={16} />
            </button>
          </div>
          <BankDashboard refreshTrigger={dashboardRefresh} />
        </section>

        {/* Connected Banks List */}
        <section className="connections-section">
          <h2>Connected Banks</h2>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} />
              <h3>No Banks Connected</h3>
              <p>Connect your first bank to start automatically importing transactions</p>
            </div>
          ) : (
            <div className="connections-list">
              {connections.map((connection) => (
                <div key={connection._id} className="connection-card">
                  <div className="connection-info">
                    <div className="institution-icon">
                      {connection.provider_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="institution-name">{connection.provider_name}</div>
                      <div className="connection-name">{connection.nickname || connection.provider_account_id}</div>
                      <div className="last-sync">
                        Last synced: {formatDate(connection.last_sync)}
                      </div>
                    </div>
                  </div>
                  <div className="connection-actions">
                    <button
                      className="action-btn sync-btn"
                      onClick={() => handleSync(connection._id)}
                      disabled={syncing === connection._id}
                      title="Sync now"
                    >
                      <RefreshCw size={16} className={syncing === connection._id ? 'spinning' : ''} />
                    </button>
                    <button
                      className="action-btn disconnect-btn"
                      onClick={() => handleDisconnect(connection._id)}
                      title="Disconnect"
                    >
                      <Unlink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Banks;
