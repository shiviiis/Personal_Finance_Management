import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import ToggleableSidebar from './components/layout/ToggleableSidebar';
import Footer from './components/layout/Footer';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Analysis from './pages/Analysis';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';

import './App.css';

const AUTH_PATHS = ['/login', '/register', '/verify-otp'];
const DASHBOARD_PATHS = ['/dashboard', '/transactions', '/analysis', '/budgets', '/accounts', '/profile'];

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const isHomePage = location.pathname === '/';
  const isDashboardPage = DASHBOARD_PATHS.includes(location.pathname);

  // Determine which content class to apply
  const contentClass = isAuthPage
    ? 'auth-content'
    : isDashboardPage
      ? 'dashboard-content'
      : 'public-content';

  return (
    <div className="app">
      {/* Navbar: shown on all pages except auth */}
      {!isAuthPage && <Navbar />}

      {/* Overlay Sidebar drawer: available on all pages with navbar */}
      {!isAuthPage && <ToggleableSidebar />}

      {/* Main content area */}
      <div className={`app-content ${contentClass}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {/* Footer: only on home and contact pages */}
      {(isHomePage || location.pathname === '/contact') && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;