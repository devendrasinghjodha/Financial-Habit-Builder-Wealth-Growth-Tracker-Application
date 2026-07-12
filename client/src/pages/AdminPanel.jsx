import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { HiOutlineUsers, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineFlag, HiOutlineTrash } from 'react-icons/hi';
import api from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics')
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}" and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const userGrowthData = analytics?.userGrowth?.map(item => ({
    month: monthNames[item._id - 1] || item._id,
    users: item.count
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Platform management and analytics</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['overview', 'users'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && analytics && (
        <>
          {/* KPI Stats */}
          <div className="admin-stats">
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px' }}><HiOutlineUsers /></div>
              <div className="admin-stat-value">{analytics.totalUsers}</div>
              <div className="admin-stat-label">Total Users</div>
            </div>
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--success)' }}><HiOutlineUsers /></div>
              <div className="admin-stat-value">{analytics.activeUsers}</div>
              <div className="admin-stat-label">Active Users (30d)</div>
            </div>
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--info)' }}><HiOutlineChartBar /></div>
              <div className="admin-stat-value">{analytics.totalTransactions}</div>
              <div className="admin-stat-label">Total Transactions</div>
            </div>
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--purple)' }}><HiOutlineLightningBolt /></div>
              <div className="admin-stat-value">{analytics.activeHabits}</div>
              <div className="admin-stat-label">Active Habits</div>
            </div>
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--warning)' }}><HiOutlineFlag /></div>
              <div className="admin-stat-value">{analytics.totalGoals}</div>
              <div className="admin-stat-label">Savings Goals</div>
            </div>
            <div className="admin-stat fade-in">
              <div style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--success)' }}>✅</div>
              <div className="admin-stat-value">{analytics.completedGoals}</div>
              <div className="admin-stat-label">Completed Goals</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="charts-grid">
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '20px' }}>Key Performance Indicators</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Engagement Rate</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{analytics.engagementRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${analytics.engagementRate}%` }}></div>
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Goal Completion Rate</span>
                    <span style={{ color: 'var(--info)', fontWeight: 700 }}>{analytics.goalCompletionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${analytics.goalCompletionRate}%`, background: '#3b82f6' }}></div>
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Avg Habit Streak</span>
                    <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{analytics.avgStreak} days</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(analytics.avgStreak * 5, 100)}%`, background: '#8b5cf6' }}></div>
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Platform Volume</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                      ₹{analytics.totalVolume?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">User Registrations</h3>
                <span className="badge badge-green">Last 6 months</span>
              </div>
              {userGrowthData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)',
                          borderRadius: 'var(--radius-md)', fontSize: '13px'
                        }}
                      />
                      <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} name="New Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state"><p>No registration data</p></div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Management</h3>
            <span className="badge badge-blue">{users.length} total</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Transactions</th>
                  <th>Habits</th>
                  <th>Goals</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, color: 'var(--bg-primary)', flexShrink: 0
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.transactionCount}</td>
                    <td>{u.habitCount}</td>
                    <td>{u.goalCount}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDeleteUser(u._id, u.name)}>
                          <HiOutlineTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
