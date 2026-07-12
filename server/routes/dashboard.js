const express = require('express');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get aggregated dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total income and expenses (all time)
    const allTimeIncome = await Transaction.aggregate([
      { $match: { userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const allTimeExpense = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly income and expenses
    const monthlyIncome = await Transaction.aggregate([
      { $match: { userId, type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyExpense = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total savings from goals
    const savingsTotal = await SavingsGoal.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$currentAmount' }, target: { $sum: '$targetAmount' } } }
    ]);

    // Active habits count and streaks
    const habits = await Habit.find({ userId, isActive: true });
    const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // Active savings goals
    const activeGoals = await SavingsGoal.find({ userId, isCompleted: false })
      .sort({ createdAt: -1 })
      .limit(4);

    const totalInc = allTimeIncome[0]?.total || 0;
    const totalExp = allTimeExpense[0]?.total || 0;

    res.json({
      netWorth: totalInc - totalExp,
      totalIncome: totalInc,
      totalExpense: totalExp,
      monthlyIncome: monthlyIncome[0]?.total || 0,
      monthlyExpense: monthlyExpense[0]?.total || 0,
      monthlySavings: (monthlyIncome[0]?.total || 0) - (monthlyExpense[0]?.total || 0),
      totalSaved: savingsTotal[0]?.total || 0,
      savingsTarget: savingsTotal[0]?.target || 0,
      activeHabits: habits.length,
      totalStreaks,
      recentTransactions,
      activeGoals,
      habits: habits.slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// @route   GET /api/dashboard/wealth-history
// @desc    Get wealth growth data over last 6 months
router.get('/wealth-history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const months = parseInt(req.query.months) || 6;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

      const income = await Transaction.aggregate([
        { $match: { userId, type: 'income', date: { $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const expense = await Transaction.aggregate([
        { $match: { userId, type: 'expense', date: { $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      data.push({
        month: monthNames[targetDate.getMonth()],
        year: targetDate.getFullYear(),
        income: income[0]?.total || 0,
        expense: expense[0]?.total || 0,
        netWorth: (income[0]?.total || 0) - (expense[0]?.total || 0)
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching wealth history' });
  }
});

module.exports = router;
