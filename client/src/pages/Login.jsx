import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    monthlyIncome: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password, parseFloat(formData.monthlyIncome) || 0);
      } else {
        if (!formData.email || !formData.password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">₹</div>
            <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isRegister ? 'Start your financial journey today' : 'Track your wealth, build habits'}</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder={isRegister ? 'Create a password (min 6 chars)' : 'Enter your password'}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Monthly Income (₹) - Optional</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  className="form-input"
                  placeholder="e.g., 50000"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="login-toggle">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {!isRegister && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-accent)' }}>Demo Credentials:</strong><br />
              User: rahul@example.com / password123<br />
              Admin: admin@fintrack.com / admin123
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
