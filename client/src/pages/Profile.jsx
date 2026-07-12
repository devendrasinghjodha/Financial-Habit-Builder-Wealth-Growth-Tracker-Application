import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineCash, HiOutlineBriefcase, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    monthlyIncome: user?.monthlyIncome || 0,
    occupation: user?.financialProfile?.occupation || '',
    financialGoal: user?.financialProfile?.financialGoal || '',
    riskTolerance: user?.financialProfile?.riskTolerance || 'medium'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = async () => {
    try {
      setError('');
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        monthlyIncome: parseFloat(profileData.monthlyIncome),
        financialProfile: {
          occupation: profileData.occupation,
          financialGoal: profileData.financialGoal,
          riskTolerance: profileData.riskTolerance
        }
      });
      updateUser(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your personal and financial information</p>
      </div>

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px',
          color: 'var(--success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <HiOutlineCheck /> {success}
        </div>
      )}

      {error && (
        <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      <div className="profile-grid">
        {/* Personal Info */}
        <div className="card profile-card-large">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{getInitials(user?.name)}</div>
            <div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">{user?.role === 'admin' ? '👑 Administrator' : '💼 Member'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditing(!editing); setError(''); }}>
              {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setChangingPassword(!changingPassword); setError(''); }}>
              <HiOutlineLockClosed /> Change Password
            </button>
          </div>

          {editing ? (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Income (₹)</label>
                  <input type="number" className="form-input" value={profileData.monthlyIncome}
                    onChange={(e) => setProfileData({ ...profileData, monthlyIncome: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input type="text" className="form-input" value={profileData.occupation}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Risk Tolerance</label>
                  <select className="form-select" value={profileData.riskTolerance}
                    onChange={(e) => setProfileData({ ...profileData, riskTolerance: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Financial Goal</label>
                <textarea className="form-textarea" value={profileData.financialGoal}
                  onChange={(e) => setProfileData({ ...profileData, financialGoal: e.target.value })}
                  placeholder="What's your primary financial goal?" />
              </div>
              <button className="btn btn-primary" onClick={handleProfileSave}>Save Changes</button>
            </div>
          ) : (
            <ul className="profile-info-list">
              <li className="profile-info-item">
                <span className="profile-info-label"><HiOutlineUser style={{ verticalAlign: 'middle', marginRight: '8px' }} />Name</span>
                <span className="profile-info-value">{user?.name}</span>
              </li>
              <li className="profile-info-item">
                <span className="profile-info-label"><HiOutlineMail style={{ verticalAlign: 'middle', marginRight: '8px' }} />Email</span>
                <span className="profile-info-value">{user?.email}</span>
              </li>
              <li className="profile-info-item">
                <span className="profile-info-label"><HiOutlineCash style={{ verticalAlign: 'middle', marginRight: '8px' }} />Monthly Income</span>
                <span className="profile-info-value">₹{user?.monthlyIncome?.toLocaleString('en-IN') || 0}</span>
              </li>
              <li className="profile-info-item">
                <span className="profile-info-label"><HiOutlineBriefcase style={{ verticalAlign: 'middle', marginRight: '8px' }} />Occupation</span>
                <span className="profile-info-value">{user?.financialProfile?.occupation || 'Not set'}</span>
              </li>
              <li className="profile-info-item">
                <span className="profile-info-label">🎯 Financial Goal</span>
                <span className="profile-info-value">{user?.financialProfile?.financialGoal || 'Not set'}</span>
              </li>
              <li className="profile-info-item">
                <span className="profile-info-label">⚖️ Risk Tolerance</span>
                <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>
                  {user?.financialProfile?.riskTolerance || 'medium'}
                </span>
              </li>
            </ul>
          )}
        </div>

        {/* Password Change */}
        {changingPassword && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Change Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={handlePasswordChange}>Update Password</button>
          </div>
        )}

        {/* Account Info */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Account Details</h3>
          <ul className="profile-info-list">
            <li className="profile-info-item">
              <span className="profile-info-label">Account Type</span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </li>
            <li className="profile-info-item">
              <span className="profile-info-label">Member Since</span>
              <span className="profile-info-value">
                {new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </li>
            <li className="profile-info-item">
              <span className="profile-info-label">User ID</span>
              <span className="profile-info-value" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                {user?.id || user?._id}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
