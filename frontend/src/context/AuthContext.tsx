import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  Email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstname: string, lastname: string, email: string, password: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (firstname: string, lastname: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/users/register', {
        firstname,
        lastname,
        Email: email,
        Password: password,
      });
      toast.success(response.data.message || 'Registration successful! Please verify your email.');
    } catch (error: any) {
      toast.error(error || 'Registration failed');
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await api.post('/api/users/verify-otp', {
        Email: email,
        otp,
      });
      toast.success(response.data.message || 'Email verified successfully!');
    } catch (error: any) {
      toast.error(error || 'OTP verification failed');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/users/login', {
        Email: email,
        Password: password,
      });

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        verifyOTP,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: 'var(--color-text-secondary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};
