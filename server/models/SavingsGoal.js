const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: false
  },
  category: {
    type: String,
    enum: ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Car', 'Retirement', 'Wedding', 'Gadgets', 'Investment', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  contributions: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
savingsGoalSchema.index({ userId: 1, isCompleted: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
