import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Receipt, TrendingUp, Wallet, CreditCard, User, LogOut } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';


const Navbar: React.FC = () => {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Sidebar Toggle + Logo */}
        <div className="navbar-left">
          <button 
            className="dashboard-menu-trigger"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="navbar-logo">
            <span className="logo-text gradient-text">FinanceFlow</span>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>

        {/* Right Side - Auth */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
                </div>
                <span className="user-name">{user?.firstname} {user?.lastname}</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={() => { logout(); setIsUserMenuOpen(false); }}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/register" className="btn-register">Get Started</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          
          {/* Dashboard Section */}
          <div className="mobile-section">
            <p className="mobile-section-title">Dashboard</p>
            <Link to="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <Link to="/transactions" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <Receipt size={18} />
              <span>Records</span>
            </Link>
            <Link to="/analysis" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <TrendingUp size={18} />
              <span>Analysis</span>
            </Link>
            <Link to="/budgets" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <Wallet size={18} />
              <span>Budgets</span>
            </Link>
            <Link to="/accounts" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <CreditCard size={18} />
              <span>Accounts</span>
            </Link>
            <Link to="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
              <User size={18} />
              <span>Profile</span>
            </Link>
          </div>

          <Link to="/contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>

          {isAuthenticated ? (
            <button className="mobile-link logout-btn" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link to="/register" className="mobile-link register-link" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;