import React, { useState } from 'react';
import axios from 'axios';
import './CSS_primary/profile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ExportImport: React.FC = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Handle Export Data
  const handleExport = async () => {
    setExportLoading(true);
    setMessage(null);

    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/api/data/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'finance-backup.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error: any) {
      console.error('Export error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to export data' 
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Handle File Selection for Import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Preview the data
        await previewImport(importData);
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid JSON file format' });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview Import Data
  const previewImport = async (data: any) => {
    setMessage(null);
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/data/import/preview`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPreviewData(response.data);
      setMessage({ type: 'success', text: 'File loaded successfully! Review the preview below.' });
    } catch (error: any) {
      console.error('Preview error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to preview import data' 
      });
      setPreviewData(null);
    }
  };

  // Handle Import Data
  const handleImport = async () => {
    if (!previewData) return;

    setImportLoading(true);
    setMessage(null);

    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/data/import${clearExisting ? '?clear=true' : ''}`,
        previewData.originalResponse || previewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${response.data.importedCount} transactions!` 
      });
      setPreviewData(null);
      
      // Reload page after successful import to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Import error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to import data' 
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="export-import-container">
      <h2>Data Management</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Export Section */}
      <div className="export-section">
        <h3>Export Your Data</h3>
        <p>Download all your transactions and financial data as a JSON file.</p>
        <button 
          onClick={handleExport}
          disabled={exportLoading}
          className="btn-primary"
        >
          {exportLoading ? 'Exporting...' : '📥 Export Data'}
        </button>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h3>Import Data</h3>
        <p>Restore your data from a previously exported JSON backup file.</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="import-file-input"
        />
        
        <label htmlFor="import-file-input" className="btn-secondary">
          📤 Choose Backup File
        </label>

        {/* Clear Existing Data Option */}
        <div className="import-options">
          <label>
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
            />
            Clear existing data before importing (recommended for full restore)
          </label>
        </div>

        {/* Preview Section */}
        {previewData && (
          <div className="import-preview">
            <h4>Import Preview</h4>
            <div className="preview-stats">
              <div className="stat-card">
                <strong>{previewData.statistics.totalTransactions}</strong>
                <span>Transactions</span>
              </div>
              <div className="stat-card">
                <strong style={{ color: '#10b981' }}>
                  ₹{previewData.statistics.totalIncome.toLocaleString()}
                </strong>
                <span>Total Income</span>
              </div>
              <div className="stat-card">
                <strong style={{ color: '#ef4444' }}>
                  ₹{previewData.statistics.totalExpense.toLocaleString()}
                </strong>
                <span>Total Expense</span>
              </div>
            </div>

            {previewData.statistics.dateRange.earliest && (
              <p className="date-range">
                Date Range: {new Date(previewData.statistics.dateRange.earliest).toLocaleDateString()} - {new Date(previewData.statistics.dateRange.latest).toLocaleDateString()}
              </p>
            )}

            <p className="categories-info">
              Categories: {previewData.statistics.categories.join(', ')}
            </p>

            <div className="preview-actions">
              <button 
                onClick={handleImport}
                disabled={importLoading}
                className="btn-success"
              >
                {importLoading ? 'Importing...' : '✅ Confirm Import'}
              </button>
              <button 
                onClick={() => setPreviewData(null)}
                className="btn-danger"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warning Note */}
      <div className="import-warning">
        <strong>⚠️ Important Notes:</strong>
        <ul>
          <li>Exported data includes all your transactions</li>
          <li>Import will add transactions to your existing data (unless you check "Clear existing data")</li>
          <li>Make sure the backup file is in valid JSON format</li>
          <li>Keep your backup files secure - they contain sensitive financial information</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportImport;
