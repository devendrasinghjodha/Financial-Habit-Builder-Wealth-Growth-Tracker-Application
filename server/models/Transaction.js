const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Salary', 'Freelance', 'Investment Returns', 'Business', 'Other Income',
      'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment',
      'Shopping', 'Healthcare', 'Education', 'Insurance', 'Savings',
      'EMI', 'Subscriptions', 'Travel', 'Gifts', 'Other Expense'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
