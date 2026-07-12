import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineCash, HiOutlineScale } from 'react-icons/hi';
import api from '../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

const WealthAnalytics = () => {
  const [wealthHistory, setWealthHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    fetchData();
  }, [months]);

  const fetchData = async () => {
    try {
      const [wealthRes, summaryRes, dashRes] = await Promise.all([
        api.get(`/dashboard/wealth-history?months=${months}`),
        api.get('/transactions/summary'),
        api.get('/dashboard')
      ]);
      setWealthHistory(wealthRes.data);
      setSummary(summaryRes.data);
      setDashData(dashRes.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  // Calculate Financial Health Score (0-100)
  const savingsRate = summary?.totalIncome > 0 ? (summary.netSavings / summary.totalIncome) * 100 : 0;
  const healthScore = Math.min(100, Math.max(0, Math.round(
    (savingsRate > 0 ? Math.min(savingsRate * 2, 40) : 0) +
    (dashData?.activeHabits > 0 ? Math.min(dashData.activeHabits * 8, 30) : 0) +
    (dashData?.totalStreaks > 0 ? Math.min(dashData.totalStreaks * 2, 20) : 0) +
    (dashData?.totalSaved > 0 ? Math.min(10, 10) : 0)
  )));

  const getHealthLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6' };
    if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Needs Improvement', color: '#ef4444' };
  };

  const health = getHealthLabel(healthScore);

  // Expense category data for pie chart
  const expensePieData = summary?.expenseByCategory?.map(item => ({
    name: item._id,
    value: item.total
  })) || [];

  // Income category data
  const incomePieData = summary?.incomeByCategory?.map(item => ({
    name: item._id,
    value: item.total
  })) || [];

  // Monthly savings data from wealth history
  const savingsData = wealthHistory.map((item, idx) => ({
    month: item.month,
    savings: idx > 0 ? item.netWorth - wealthHistory[idx - 1].netWorth : item.netWorth
  }));

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Wealth Analytics</h1>
            <p>Deep insights into your financial journey</p>
          </div>
          <div className="filters-bar" style={{ margin: 0 }}>
            <select className="filter-select" value={months} onChange={(e) => setMonths(parseInt(e.target.value))}>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="charts-grid" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="health-score">
            <div className="health-score-value" style={{ color: health.color, WebkitTextFillColor: health.color }}>
              {healthScore}
            </div>
            <div className="health-score-label" style={{ color: health.color }}>{health.label}</div>
            <div className="health-score-desc">Financial Health Score</div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, max: 40, score: Math.min(savingsRate * 2, 40), color: '#10b981' },
              { label: 'Active Habits', value: `${dashData?.activeHabits || 0} habits`, max: 30, score: Math.min((dashData?.activeHabits || 0) * 8, 30), color: '#3b82f6' },
              { label: 'Habit Streaks', value: `${dashData?.totalStreaks || 0} days`, max: 20, score: Math.min((dashData?.totalStreaks || 0) * 2, 20), color: '#8b5cf6' },
              { label: 'Savings Goals', value: dashData?.totalSaved > 0 ? 'Active' : 'None', max: 10, score: dashData?.totalSaved > 0 ? 10 : 0, color: '#f59e0b' }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{
                    width: `${(item.score / item.max) * 100}%`,
                    background: item.color
                  }}></div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.score.toFixed(0)}/{item.max} points
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon green"><HiOutlineCash /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(dashData?.netWorth || 0)}</div>
          <div className="stat-card-label">Net Worth</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon blue"><HiOutlineTrendingUp /></div>
          </div>
          <div className="stat-card-value">{savingsRate.toFixed(1)}%</div>
          <div className="stat-card-label">Savings Rate</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon purple"><HiOutlineChartBar /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(summary?.totalIncome || 0)}</div>
          <div className="stat-card-label">Monthly Income</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow"><HiOutlineScale /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(dashData?.totalSaved || 0)}</div>
          <div className="stat-card-label">Total Saved</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Net Worth Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Net Worth Trend</h3>
            <span className="badge badge-green">Growth</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthHistory}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="netWorth" stroke="#10b981" fill="url(#nwGrad)" strokeWidth={2.5} name="Net Worth" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Income vs Expenses</h3>
            <span className="badge badge-blue">Comparison</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthHistory}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fill="url(#incGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Expense Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Expense Breakdown</h3>
          </div>
          {expensePieData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {expensePieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state"><p>No expense data</p></div>
          )}
        </div>

        {/* Income Sources */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Income Sources</h3>
          </div>
          {incomePieData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {incomePieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state"><p>No income data</p></div>
          )}
        </div>
      </div>

      {/* Monthly Insights */}
      {summary && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>💡 Monthly Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly Savings</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: summary.netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{summary.netSavings?.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {summary.netSavings >= 0 ? '✅ You saved this month!' : '⚠️ Expenses exceeded income'}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Top Expense Category</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {expensePieData[0]?.name || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                ₹{expensePieData[0]?.value?.toLocaleString('en-IN') || 0} spent
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Daily Average Spend</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{Math.round((summary.totalExpense || 0) / 30).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Per day this month
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WealthAnalytics;
