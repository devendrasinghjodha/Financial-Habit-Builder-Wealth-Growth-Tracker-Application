import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { HiOutlineCash, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineStar, HiOutlineLightningBolt, HiOutlineFlag } from 'react-icons/hi';
import api from '../services/api';

const formatCurrency = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="value" style={{ color: item.color }}>
            {item.name}: ₹{item.value?.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [wealthHistory, setWealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, wealthRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/wealth-history')
      ]);
      setData(dashRes.data);
      setWealthHistory(wealthRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!data) {
    return <div className="empty-state"><h3>Unable to load dashboard</h3></div>;
  }

  const monthlySavingsRate = data.monthlyIncome > 0
    ? ((data.monthlySavings / data.monthlyIncome) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Financial Dashboard</h1>
        <p>Your complete financial overview at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon green"><HiOutlineCash /></div>
            {data.monthlySavings > 0 && <span className="stat-card-trend up">+{monthlySavingsRate}%</span>}
          </div>
          <div className="stat-card-value">{formatCurrency(data.netWorth)}</div>
          <div className="stat-card-label">Net Worth</div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon blue"><HiOutlineTrendingUp /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(data.monthlyIncome)}</div>
          <div className="stat-card-label">Monthly Income</div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon red"><HiOutlineTrendingDown /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(data.monthlyExpense)}</div>
          <div className="stat-card-label">Monthly Expenses</div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow"><HiOutlineStar /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(data.totalSaved)}</div>
          <div className="stat-card-label">Total Saved</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Wealth Growth Chart */}
        <div className="chart-card fade-in">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Wealth Growth</h3>
            <span className="badge badge-green">Last 6 months</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthHistory}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="netWorth" stroke="#10b981" fill="url(#netWorthGrad)" strokeWidth={2.5} name="Net Worth" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="chart-card fade-in">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Income vs Expenses</h3>
            <span className="badge badge-blue">Monthly</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wealthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="charts-grid">
        {/* Recent Transactions */}
        <div className="card fade-in">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <Link to="/expenses" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {data.recentTransactions?.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>{t.description || t.category}</td>
                      <td><span className="badge badge-blue">{t.category}</span></td>
                      <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent transactions</p>
            </div>
          )}
        </div>

        {/* Active Habits & Goals */}
        <div className="card fade-in">
          <div className="card-header">
            <h3 className="card-title">Active Habits</h3>
            <Link to="/habits" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {data.habits?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.habits.map((habit) => (
                <div key={habit._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{habit.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{habit.frequency}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-accent)' }}>
                      🔥 {habit.currentStreak}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>streak</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No active habits yet</p>
              <Link to="/habits" className="btn btn-sm btn-primary">Create Habit</Link>
            </div>
          )}

          {/* Savings Goals */}
          {data.activeGoals?.length > 0 && (
            <>
              <div style={{ margin: '20px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="card-title">Savings Goals</h3>
                <Link to="/savings" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              {data.activeGoals.map((goal) => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{goal.name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-accent)', fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
