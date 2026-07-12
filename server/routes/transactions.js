const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get monthly spending summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Income summary
    const incomeAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Expense summary
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = incomeAgg.reduce((sum, item) => sum + item.total, 0);
    const totalExpense = expenseAgg.reduce((sum, item) => sum + item.total, 0);

    res.json({
      month: targetMonth + 1,
      year: targetYear,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
      incomeByCategory: incomeAgg,
      expenseByCategory: expenseAgg
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating summary' });
  }
});

// @route   POST /api/transactions
// @desc    Add new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: 'Please provide type, category, and amount' });
    }

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      category,
      amount: parseFloat(amount),
      description: description || '',
      date: date ? new Date(date) : new Date()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { type, category, amount, description, date } = req.body;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount) transaction.amount = parseFloat(amount);
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
