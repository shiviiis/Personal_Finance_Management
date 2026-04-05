import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './BankConnect.css';

interface BankConnectProps {
  onConnectionSuccess: () => void;
}

const BankConnect: React.FC<BankConnectProps> = ({ onConnectionSuccess }) => {
  const [fastLinkToken, setFastLinkToken] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yodleeLoaded, setYodleeLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Load Yodlee FastLink SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.yodlee.com/fastlink/2.0.0/fastlink.js';
    script.async = true;
    script.onload = () => {
      console.log('Yodlee FastLink SDK loaded');
      setYodleeLoaded(true);
      setDebugInfo('SDK loaded, fetching token...');
    };
    script.onerror = () => {
      console.error('Failed to load Yodlee FastLink SDK');
      setError('Failed to load Yodlee FastLink. Please check your internet connection and refresh.');
      setDebugInfo('SDK failed to load');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (yodleeLoaded) {
      fetchFastLinkToken();
    }
  }, [yodleeLoaded]);

  const fetchFastLinkToken = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Fetching token from backend...');
      const response = await api.post('/api/banks/link/token/create');
      if (response.data.success) {
        setFastLinkToken(response.data.fastLinkToken);
        setUserSession(response.data.userSession);
        setDebugInfo(`Token fetched: ${response.data.fastLinkToken?.substring(0, 20)}...`);
      } else {
        throw new Error(response.data.message || 'Failed to get token');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to initialize bank connection';
      setError(errorMsg);
      setDebugInfo(`Error: ${errorMsg}`);
      console.error('Error fetching FastLink token:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleYodleeSuccess = useCallback(async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!userSession) {
        throw new Error('User session not found. Please refresh and try again.');
      }

      const response = await api.post('/api/banks/link/token/exchange', {
        accessToken,
        userSession,
      });

      if (response.data.success) {
        onConnectionSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to connect bank';
      setError(errorMsg);
      console.error('Error exchanging token:', err);
    } finally {
      setLoading(false);
    }
  }, [userSession, onConnectionSuccess]);

  const openYodleeFastLink = useCallback(() => {
    if (!fastLinkToken || !window.yodlee) {
      console.error('Yodlee FastLink not ready', { fastLinkToken: !!fastLinkToken, yodlee: !!window.yodlee });
      setError('Yodlee is not ready. Please refresh the page and try again.');
      return;
    }

    try {
      setDebugInfo('Opening Yodlee FastLink...');

      // Initialize FastLink with the token
      const config = {
        fastLinkURL: fastLinkToken,
        redirectUri: window.location.origin + '/banks',
        onSuccess: (params: any) => {
          console.log('Yodlee FastLink success:', params);
          const accessToken = params.accessToken;
          if (accessToken) {
            handleYodleeSuccess(accessToken);
          } else {
            setError('No access token received from Yodlee. Please try again.');
            setDebugInfo('No access token in callback');
          }
        },
        onError: (error: any) => {
          console.error('Yodlee FastLink error:', error);
          setError('Bank connection failed or was cancelled. Please try again.');
          setDebugInfo(`FastLink error: ${JSON.stringify(error)}`);
        },
        onExit: (data: any) => {
          console.log('Yodlee FastLink exited:', data);
          if (data?.error) {
            setDebugInfo(`FastLink exited with error: ${JSON.stringify(data.error)}`);
          } else {
            setDebugInfo('FastLink closed');
          }
        },
      };

      // Try to open FastLink
      if (window.yodlee && window.yodlee.fastLink && window.yodlee.fastLink.open) {
        window.yodlee.fastLink.open(config);
        setDebugInfo('FastLink opened in popup');
      } else {
        // Fallback: Open in new window
        console.warn('FastLink.open not available, using fallback');
        const popup = window.open('', 'yodlee-fastlink', 'width=800,height=600');
        if (popup) {
          popup.location.href = fastLinkToken;
          setDebugInfo('FastLink opened in new window (fallback)');
        } else {
          setError('Pop-up blocked! Please allow pop-ups for this site.');
          setDebugInfo('Popup blocked by browser');
        }
      }

    } catch (err) {
      console.error('Error opening Yodlee FastLink:', err);
      setError('Failed to open bank connection. Please try again.');
      setDebugInfo(`Exception: ${err}`);
    }
  }, [fastLinkToken, handleYodleeSuccess]);

  if (loading && !fastLinkToken) {
    return (
      <div className="bank-connect-container">
        <div className="bank-connect-card">
          <div className="bank-connect-loading">
            <div className="spinner"></div>
            <p>Connecting to Yodlee...</p>
            <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{debugInfo}</small>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bank-connect-container">
        <div className="bank-connect-card">
          <div className="bank-connect-error">
            <p className="error-message">{error}</p>
            <button onClick={fetchFastLinkToken} className="retry-btn">
              Retry
            </button>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
              Debug: {debugInfo}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-connect-container">
      <div className="bank-connect-card">
        <div className="icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3>Connect Your Bank</h3>
        <p>Securely connect your bank account using Yodlee to automatically import transactions and track your balances in real-time.</p>

        <div className="features-list">
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Auto-import transactions</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Real-time balance updates</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Multiple bank support</span>
          </div>
        </div>

        <button
          className="connect-bank-btn"
          onClick={openYodleeFastLink}
          disabled={!fastLinkToken || !yodleeLoaded || loading}
        >
          {loading ? 'Connecting...' : 'Connect Bank'}
        </button>

        <p className="security-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secured by Yodlee. We never store your bank credentials.
        </p>

        {/* Debug info - remove in production */}
        {import.meta.env.DEV && debugInfo && (
          <p style={{ fontSize: '0.7rem', marginTop: '1rem', opacity: 0.5, fontFamily: 'monospace' }}>
            Debug: {debugInfo}
          </p>
        )}
      </div>
    </div>
  );
};

// Extend Window interface to include Yodlee
declare global {
  interface Window {
    yodlee: any;
  }
}

export default BankConnect;
