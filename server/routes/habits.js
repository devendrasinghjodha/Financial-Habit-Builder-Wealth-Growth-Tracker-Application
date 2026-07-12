const express = require('express');
const Habit = require('../models/Habit');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/habits
// @desc    Get all habits for the user
router.get('/', auth, async (req, res) => {
  try {
    const { active } = req.query;
    const query = { userId: req.user._id };
    if (active !== undefined) query.isActive = active === 'true';

    const habits = await Habit.find(query).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching habits' });
  }
});

// @route   POST /api/habits
// @desc    Create new financial habit
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, frequency, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const habit = new Habit({
      userId: req.user._id,
      name,
      description: description || '',
      frequency: frequency || 'daily',
      category: category || 'saving'
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating habit' });
  }
});

// @route   PUT /api/habits/:id/complete
// @desc    Mark habit as completed for today
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const alreadyCompleted = habit.completions.some(c => {
      const compDate = new Date(c.date);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Add completion
    habit.completions.push({ date: new Date(), note: req.body.note || '' });

    // Calculate streak
    const sortedCompletions = habit.completions
      .map(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .sort((a, b) => b - a);

    let streak = 1;
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 1; i < sortedCompletions.length; i++) {
      const diff = sortedCompletions[i - 1] - sortedCompletions[i];
      if (diff === oneDay) {
        streak++;
      } else {
        break;
      }
    }

    habit.currentStreak = streak;
    if (streak > habit.bestStreak) {
      habit.bestStreak = streak;
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ message: 'Server error completing habit' });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update habit
router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const { name, description, frequency, category, isActive } = req.body;
    if (name) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (frequency) habit.frequency = frequency;
    if (category) habit.category = category;
    if (isActive !== undefined) habit.isActive = isActive;

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating habit' });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting habit' });
  }
});

module.exports = router;
