import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import HabitTracker from './pages/HabitTracker';
import SavingsGoals from './pages/SavingsGoals';
import WealthAnalytics from './pages/WealthAnalytics';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/expenses" element={
        <ProtectedRoute>
          <AppLayout><ExpenseTracker /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/habits" element={
        <ProtectedRoute>
          <AppLayout><HabitTracker /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/savings" element={
        <ProtectedRoute>
          <AppLayout><SavingsGoals /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><WealthAnalytics /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AppLayout><AdminPanel /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
