import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX, HiOutlineCash, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';
import api from '../services/api';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Savings', 'EMI', 'Subscriptions', 'Travel', 'Gifts', 'Other Expense'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment Returns', 'Business', 'Other Income'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#e879f9', '#fb923c', '#22d3ee', '#a78bfa', '#fbbf24'];

const formatCurrency = (val) => `₹${val?.toLocaleString('en-IN') || 0}`;

const ExpenseTracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    type: 'expense', category: 'Food', amount: '', description: '', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [filterType, filterCategory]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;

      const [txRes, sumRes] = await Promise.all([
        api.get('/transactions', { params: { ...params, limit: 100 } }),
        api.get('/transactions/summary')
      ]);
      setTransactions(txRes.data.transactions);
      setSummary(sumRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setShowModal(false);
      setFormData({ type: 'expense', category: 'Food', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const pieData = summary?.expenseByCategory?.map(item => ({
    name: item._id,
    value: item.total
  })) || [];

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Expense Tracker</h1>
        <p>Track and manage your income & expenses</p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card fade-in">
            <div className="stat-card-header">
              <div className="stat-card-icon blue"><HiOutlineTrendingUp /></div>
            </div>
            <div className="stat-card-value">{formatCurrency(summary.totalIncome)}</div>
            <div className="stat-card-label">Income this month</div>
          </div>
          <div className="stat-card fade-in">
            <div className="stat-card-header">
              <div className="stat-card-icon red"><HiOutlineTrendingDown /></div>
            </div>
            <div className="stat-card-value">{formatCurrency(summary.totalExpense)}</div>
            <div className="stat-card-label">Expenses this month</div>
          </div>
          <div className="stat-card fade-in">
            <div className="stat-card-header">
              <div className="stat-card-icon green"><HiOutlineCash /></div>
              <span className={`stat-card-trend ${summary.netSavings >= 0 ? 'up' : 'down'}`}>
                {summary.savingsRate}%
              </span>
            </div>
            <div className="stat-card-value">{formatCurrency(summary.netSavings)}</div>
            <div className="stat-card-label">Net Savings</div>
          </div>
        </div>
      )}

      {/* Charts & Transactions */}
      <div className="charts-grid">
        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Expense Breakdown</h3>
          </div>
          {pieData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state"><p>No expense data for this month</p></div>
          )}
        </div>

        {/* Filters + Add Button */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transactions</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <HiOutlinePlus /> Add
            </button>
          </div>

          <div className="filters-bar">
            <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td>{t.description || t.category}</td>
                    <td><span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`}>{t.category}</span></td>
                    <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button className="btn btn-icon btn-danger" onClick={() => handleDelete(t._id)}>
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="empty-state"><p>No transactions found</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Transaction</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={formData.type}
                      onChange={(e) => setFormData({
                        ...formData, type: e.target.value,
                        category: e.target.value === 'income' ? 'Salary' : 'Food'
                      })}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="0" required min="1"
                      value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input"
                      value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-input" placeholder="What was this for?"
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
