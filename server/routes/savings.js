const express = require('express');
const SavingsGoal = require('../models/SavingsGoal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/savings
// @desc    Get all savings goals
router.get('/', auth, async (req, res) => {
  try {
    const { completed } = req.query;
    const query = { userId: req.user._id };
    if (completed !== undefined) query.isCompleted = completed === 'true';

    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching savings goals' });
  }
});

// @route   POST /api/savings
// @desc    Create new savings goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetAmount, deadline, category, priority } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Please provide goal name and target amount' });
    }

    const goal = new SavingsGoal({
      userId: req.user._id,
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline ? new Date(deadline) : undefined,
      category: category || 'Other',
      priority: priority || 'medium'
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating savings goal' });
  }
});

// @route   PUT /api/savings/:id/contribute
// @desc    Add contribution to goal
router.put('/:id/contribute', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { amount, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid contribution amount' });
    }

    goal.contributions.push({
      amount: parseFloat(amount),
      date: new Date(),
      note: note || ''
    });

    goal.currentAmount += parseFloat(amount);

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding contribution' });
  }
});

// @route   PUT /api/savings/:id
// @desc    Update savings goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { name, targetAmount, deadline, category, priority } = req.body;
    if (name) goal.name = name;
    if (targetAmount) goal.targetAmount = parseFloat(targetAmount);
    if (deadline) goal.deadline = new Date(deadline);
    if (category) goal.category = category;
    if (priority) goal.priority = priority;

    // Recalculate completion
    goal.isCompleted = goal.currentAmount >= goal.targetAmount;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
});

// @route   DELETE /api/savings/:id
// @desc    Delete savings goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
});

module.exports = router;
