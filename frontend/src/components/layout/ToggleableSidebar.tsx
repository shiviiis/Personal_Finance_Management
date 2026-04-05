import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Wallet, CreditCard, User, X } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import './ToggleableSidebar.css';

const ToggleableSidebar: React.FC = () => {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLElement>(null);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/transactions', icon: Receipt, label: 'Records' },
    { path: '/analysis', icon: TrendingUp, label: 'Analysis' },
    { path: '/budgets', icon: Wallet, label: 'Budgets' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Dark backdrop overlay */}
      <div className="sidebar-overlay" onClick={closeSidebar} />
      
      {/* Sidebar drawer */}
      <aside 
        ref={sidebarRef}
        className="toggleable-sidebar sidebar-open"
      >
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <div className="sidebar-content">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default ToggleableSidebar;