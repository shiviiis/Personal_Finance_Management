import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
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

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/verify-otp'].includes(location.pathname);

  return (
    <div className="app">
      {!isAuthPage && <Navbar />}
      
      {/* Toggleable Sidebar */}
      <ToggleableSidebar />
      
      <div className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected Routes - Now Public for Demo */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {!isAuthPage && <Footer />}
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