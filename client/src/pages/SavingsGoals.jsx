import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlineFlag, HiOutlineCash } from 'react-icons/hi';
import api from '../services/api';

const GOAL_CATEGORIES = ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Car', 'Retirement', 'Wedding', 'Gadgets', 'Investment', 'Other'];

const CATEGORY_EMOJIS = {
  'Emergency Fund': '🛡️', 'Vacation': '✈️', 'Education': '📚', 'Home': '🏠',
  'Car': '🚗', 'Retirement': '🌅', 'Wedding': '💍', 'Gadgets': '💻', 'Investment': '📈', 'Other': '🎯'
};

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contributions, setContributions] = useState({});
  const [formData, setFormData] = useState({
    name: '', targetAmount: '', deadline: '', category: 'Other', priority: 'medium'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings');
      setGoals(res.data);
    } catch (error) {
      console.error('Fetch goals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings', formData);
      setShowModal(false);
      setFormData({ name: '', targetAmount: '', deadline: '', category: 'Other', priority: 'medium' });
      fetchGoals();
    } catch (error) {
      console.error('Create goal error:', error);
    }
  };

  const handleContribute = async (id) => {
    const amount = contributions[id];
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      await api.put(`/savings/${id}/contribute`, { amount: parseFloat(amount) });
      setContributions({ ...contributions, [id]: '' });
      fetchGoals();
    } catch (error) {
      console.error('Contribute error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
    } catch (error) {
      console.error('Delete goal error:', error);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.isCompleted).length;

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Savings Goals</h1>
            <p>Set financial targets and track your progress</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> New Goal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon green"><HiOutlineCash /></div>
          </div>
          <div className="stat-card-value">₹{totalSaved.toLocaleString('en-IN')}</div>
          <div className="stat-card-label">Total Saved</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon blue"><HiOutlineFlag /></div>
          </div>
          <div className="stat-card-value">₹{totalTarget.toLocaleString('en-IN')}</div>
          <div className="stat-card-label">Total Target</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow"><HiOutlineFlag /></div>
          </div>
          <div className="stat-card-value">{goals.length}</div>
          <div className="stat-card-label">Active Goals</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon purple"><HiOutlineFlag /></div>
          </div>
          <div className="stat-card-value">{completedGoals}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const emoji = CATEGORY_EMOJIS[goal.category] || '🎯';
            const daysLeft = goal.deadline ?
              Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;

            return (
              <div key={goal._id} className="goal-card fade-in">
                <div className="goal-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{emoji}</span>
                    <div>
                      <div className="goal-name">{goal.name}</div>
                      <span className={`badge badge-${goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'yellow' : 'blue'}`}>
                        {goal.priority} priority
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-icon btn-danger" onClick={() => handleDelete(goal._id)}>
                    <HiOutlineTrash />
                  </button>
                </div>

                <div className="goal-amounts">
                  <span className="goal-current">₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                  <span className="goal-target">/ ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="goal-progress">
                  <div className="goal-progress-header">
                    <span className="goal-percentage">{pct.toFixed(1)}%</span>
                    {daysLeft !== null && (
                      <span className="goal-deadline">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                      </span>
                    )}
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: goal.isCompleted ? 'var(--success)' :
                        pct > 75 ? 'var(--accent-gradient)' :
                        pct > 50 ? '#3b82f6' :
                        pct > 25 ? '#f59e0b' : '#ef4444'
                    }}></div>
                  </div>
                </div>

                {!goal.isCompleted && (
                  <div className="goal-contribute">
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      min="1"
                      value={contributions[goal._id] || ''}
                      onChange={(e) => setContributions({ ...contributions, [goal._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleContribute(goal._id)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleContribute(goal._id)}>
                      Add
                    </button>
                  </div>
                )}

                {goal.isCompleted && (
                  <div style={{
                    textAlign: 'center', padding: '10px', background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 'var(--radius-md)', color: 'var(--success)', fontWeight: 700
                  }}>
                    🎉 Goal Achieved!
                  </div>
                )}

                {goal.contributions?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Recent contributions ({goal.contributions.length} total)
                    </div>
                    {goal.contributions.slice(-3).reverse().map((c, idx) => (
                      <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '12px', padding: '4px 0', color: 'var(--text-secondary)'
                      }}>
                        <span>{new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>+₹{c.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No Savings Goals Yet</h3>
            <p>Set your first financial goal and start saving towards it.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Your First Goal</button>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Savings Goal</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Goal Name</label>
                  <input type="text" className="form-input" placeholder="e.g., Emergency Fund" required
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="100000" required min="1"
                      value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="date" className="form-input"
                      value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      {GOAL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
