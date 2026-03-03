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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, closeSidebar]);

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

  // Handler for menu items that ensures immediate closure
  const handleMenuItemClick = (path: string) => {
    closeSidebar();
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside 
      ref={sidebarRef}
      className="toggleable-sidebar sidebar-open"
    >
      <div className="sidebar-header">
        <h3>Menu</h3>
        <button className="sidebar-close-btn" onClick={closeSidebar}>
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
              onClick={() => handleMenuItemClick(item.path)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default ToggleableSidebar;