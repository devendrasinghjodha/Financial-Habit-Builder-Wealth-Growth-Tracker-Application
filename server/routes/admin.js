const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminAuth);

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get activity counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const transactionCount = await Transaction.countDocuments({ userId: user._id });
        const habitCount = await Habit.countDocuments({ userId: user._id });
        const goalCount = await SavingsGoal.countDocuments({ userId: user._id });
        
        return {
          ...user.toObject(),
          transactionCount,
          habitCount,
          goalCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalHabits = await Habit.countDocuments();
    const totalGoals = await SavingsGoal.countDocuments();
    const completedGoals = await SavingsGoal.countDocuments({ isCompleted: true });

    // User registrations over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average habit completion
    const habits = await Habit.find({ isActive: true });
    const avgStreak = habits.length > 0
      ? (habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length).toFixed(1)
      : 0;

    // Total platform volume
    const totalVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Active users (users with transactions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await Transaction.distinct('userId', {
      date: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalUsers,
      activeUsers: activeUsers.length,
      totalTransactions,
      totalHabits,
      activeHabits: habits.length,
      totalGoals,
      completedGoals,
      avgStreak: parseFloat(avgStreak),
      totalVolume: totalVolume[0]?.total || 0,
      userGrowth,
      goalCompletionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0,
      engagementRate: totalUsers > 0 ? ((activeUsers.length / totalUsers) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and their data
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow deleting yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user data
    await Transaction.deleteMany({ userId });
    await Habit.deleteMany({ userId });
    await SavingsGoal.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
