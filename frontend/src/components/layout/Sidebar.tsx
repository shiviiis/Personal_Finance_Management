import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Wallet, CreditCard, User, X } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/transactions', icon: Receipt, label: 'Records' },
    { path: '/analysis', icon: TrendingUp, label: 'Analysis' },
    { path: '/budgets', icon: Wallet, label: 'Budgets' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // If no onClose provided, it's always open (default behavior)
  if (!onClose) {
    return (
      <aside className="sidebar">
        <div className="sidebar-content">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    );
  }

  // Toggleable sidebar
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-header">
        <h3>Menu</h3>
        <button className="sidebar-close-btn" onClick={onClose}>
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
              onClick={onClose} // Close sidebar when item is clicked
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

export default Sidebar;
