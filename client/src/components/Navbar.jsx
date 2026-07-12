import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expense Tracker',
  '/habits': 'Habit Tracker',
  '/savings': 'Savings Goals',
  '/analytics': 'Wealth Analytics',
  '/profile': 'Profile',
  '/admin': 'Admin Panel'
};

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-burger" onClick={onToggleSidebar}>
          <HiOutlineMenuAlt2 />
        </button>
        <h2 className="navbar-page-title">{pageTitle}</h2>
      </div>
      <div className="navbar-right">
        <span className="navbar-greeting">
          {getGreeting()}, <span>{user?.name?.split(' ')[0]}</span>
        </span>
        <div className="navbar-avatar" title={user?.name}>
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
