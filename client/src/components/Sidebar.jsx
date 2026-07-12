import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineLightningBolt,
  HiOutlineFlag,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/expenses', icon: <HiOutlineCreditCard />, label: 'Expense Tracker' },
    { to: '/habits', icon: <HiOutlineLightningBolt />, label: 'Habit Tracker' },
    { to: '/savings', icon: <HiOutlineFlag />, label: 'Savings Goals' },
    { to: '/analytics', icon: <HiOutlineChartBar />, label: 'Wealth Analytics' },
    { to: '/profile', icon: <HiOutlineUser />, label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: <HiOutlineCog />, label: 'Admin Panel' });
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">₹</div>
          <div>
            <div className="sidebar-title">FinTrack</div>
            <div className="sidebar-subtitle">Wealth Builder</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
