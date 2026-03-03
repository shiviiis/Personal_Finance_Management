import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Receipt, TrendingUp, Wallet, CreditCard, User } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Dashboard Menu Icon - Left Side */}
        <div className="navbar-left">
          <button 
            className="dashboard-menu-trigger"
            onClick={toggleSidebar}
            aria-label="Dashboard Menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="navbar-logo">
            <span className="logo-text gradient-text">FinanceFlow</span>
          </Link>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu-container">
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
                  <button className="dropdown-item" onClick={() => { logout(); setIsUserMenuOpen(false); }}>
                    <X size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">Sign In</Link>
              <Link to="/register" className="btn-register">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          
          {/* Dashboard Section - Always visible */}
          <div className="mobile-section">
            <p className="mobile-section-title">Dashboard</p>
            <Link 
              to="/dashboard" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <Link 
              to="/transactions" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Receipt size={18} />
              <span>Records</span>
            </Link>
            <Link 
              to="/analysis" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TrendingUp size={18} />
              <span>Analysis</span>
            </Link>
            <Link 
              to="/budgets" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Wallet size={18} />
              <span>Budgets</span>
            </Link>
            <Link 
              to="/accounts" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CreditCard size={18} />
              <span>Accounts</span>
            </Link>
            <Link 
              to="/profile" 
              className="mobile-link" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          </div>

          <Link to="/contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>

          {isAuthenticated ? (
            <button className="mobile-link logout-btn" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
              <X size={18} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;