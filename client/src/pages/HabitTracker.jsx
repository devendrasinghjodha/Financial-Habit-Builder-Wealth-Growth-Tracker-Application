import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineX, HiOutlineFire, HiOutlineLightningBolt, HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi';
import api from '../services/api';

const CATEGORIES = [
  { value: 'saving', label: '💰 Saving', color: '#10b981' },
  { value: 'budgeting', label: '📊 Budgeting', color: '#3b82f6' },
  { value: 'investing', label: '📈 Investing', color: '#8b5cf6' },
  { value: 'tracking', label: '📝 Tracking', color: '#f59e0b' },
  { value: 'learning', label: '📚 Learning', color: '#ec4899' },
  { value: 'other', label: '✨ Other', color: '#64748b' }
];

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', frequency: 'daily', category: 'saving'
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (error) {
      console.error('Fetch habits error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', frequency: 'daily', category: 'saving' });
      fetchHabits();
    } catch (error) {
      console.error('Create habit error:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/habits/${id}/complete`);
      fetchHabits();
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchHabits();
    } catch (error) {
      console.error('Delete habit error:', error);
    }
  };

  const isCompletedToday = (habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habit.completions?.some(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  const getCompletionRate = (habit) => {
    if (!habit.completions?.length) return 0;
    const createdAt = new Date(habit.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.max(1, Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24)));
    return Math.min(100, ((habit.completions.length / daysSinceCreation) * 100)).toFixed(0);
  };

  const getCategoryInfo = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[5];

  // Stats
  const totalHabits = habits.filter(h => h.isActive).length;
  const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  const todayCompleted = habits.filter(h => isCompletedToday(h)).length;

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Habit Tracker</h1>
            <p>Build consistent financial habits every day</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> New Habit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon green"><HiOutlineLightningBolt /></div>
          </div>
          <div className="stat-card-value">{totalHabits}</div>
          <div className="stat-card-label">Active Habits</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow"><HiOutlineFire /></div>
          </div>
          <div className="stat-card-value">{totalStreaks}</div>
          <div className="stat-card-label">Total Streak Days</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon purple"><HiOutlineFire /></div>
          </div>
          <div className="stat-card-value">{bestStreak}</div>
          <div className="stat-card-label">Best Streak</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-header">
            <div className="stat-card-icon blue"><HiOutlineCheck /></div>
          </div>
          <div className="stat-card-value">{todayCompleted}/{totalHabits}</div>
          <div className="stat-card-label">Completed Today</div>
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length > 0 ? (
        <div className="habits-grid">
          {habits.filter(h => h.isActive).map((habit) => {
            const catInfo = getCategoryInfo(habit.category);
            const completed = isCompletedToday(habit);
            const rate = getCompletionRate(habit);

            return (
              <div key={habit._id} className="habit-card fade-in">
                <div className="habit-card-header">
                  <div>
                    <span className="badge" style={{
                      background: `${catInfo.color}20`, color: catInfo.color,
                      marginBottom: '6px', display: 'inline-block'
                    }}>
                      {catInfo.label}
                    </span>
                    <div className="habit-name">{habit.name}</div>
                  </div>
                  <button className="btn btn-icon btn-danger" style={{ flexShrink: 0 }}
                    onClick={() => handleDelete(habit._id)}>
                    <HiOutlineTrash />
                  </button>
                </div>

                {habit.description && (
                  <div className="habit-desc">{habit.description}</div>
                )}

                <div className="habit-stats">
                  <div className="habit-stat">
                    <div className="habit-stat-value">🔥 {habit.currentStreak}</div>
                    <div className="habit-stat-label">Current</div>
                  </div>
                  <div className="habit-stat">
                    <div className="habit-stat-value">⭐ {habit.bestStreak}</div>
                    <div className="habit-stat-label">Best</div>
                  </div>
                  <div className="habit-stat">
                    <div className="habit-stat-value">{rate}%</div>
                    <div className="habit-stat-label">Rate</div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {habit.frequency} • {habit.completions?.length || 0} completions
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${rate}%`, background: catInfo.color }}></div>
                  </div>
                </div>

                <button
                  className={`habit-complete-btn ${completed ? 'completed' : ''}`}
                  onClick={() => handleComplete(habit._id)}
                  disabled={completed}
                >
                  {completed ? '✓ Completed Today' : '✓ Mark as Done'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No Habits Yet</h3>
            <p>Start building your financial discipline by creating your first habit.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Your First Habit</button>
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Habit</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Habit Name</label>
                  <input type="text" className="form-input" placeholder="e.g., Save ₹500 daily" required
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe your financial habit..."
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select" value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
