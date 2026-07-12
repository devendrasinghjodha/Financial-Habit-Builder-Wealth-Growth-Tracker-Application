const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Habit = require('./models/Habit');
const SavingsGoal = require('./models/SavingsGoal');

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/financial-tracker');
  console.log('MongoDB connected for seeding');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Habit.deleteMany({});
    await SavingsGoal.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@fintrack.com',
      password: 'admin123',
      role: 'admin',
      monthlyIncome: 120000,
      financialProfile: {
        occupation: 'Platform Administrator',
        financialGoal: 'Platform management and oversight',
        riskTolerance: 'medium'
      }
    });

    const regularUser = new User({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'password123',
      role: 'user',
      monthlyIncome: 75000,
      financialProfile: {
        occupation: 'Software Developer',
        financialGoal: 'Save for a house down payment',
        riskTolerance: 'medium'
      }
    });

    const user2 = new User({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'password123',
      role: 'user',
      monthlyIncome: 55000,
      financialProfile: {
        occupation: 'Marketing Manager',
        financialGoal: 'Build emergency fund and invest',
        riskTolerance: 'low'
      }
    });

    await adminUser.save();
    await regularUser.save();
    await user2.save();
    console.log('Users created');

    // Create 6 months of transactions for Rahul
    const now = new Date();
    const transactions = [];

    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

      // Monthly salary
      transactions.push({
        userId: regularUser._id,
        type: 'income',
        category: 'Salary',
        amount: 75000,
        description: 'Monthly salary credit',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      });

      // Freelance income (some months)
      if (m % 2 === 0) {
        transactions.push({
          userId: regularUser._id,
          type: 'income',
          category: 'Freelance',
          amount: 15000 + Math.floor(Math.random() * 10000),
          description: 'Freelance web development project',
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15)
        });
      }

      // Rent
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Rent',
        amount: 18000,
        description: 'Monthly apartment rent',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5)
      });

      // Utilities
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Utilities',
        amount: 2500 + Math.floor(Math.random() * 1000),
        description: 'Electricity and water bill',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 7)
      });

      // Food expenses (multiple per month)
      for (let w = 0; w < 4; w++) {
        transactions.push({
          userId: regularUser._id,
          type: 'expense',
          category: 'Food',
          amount: 3000 + Math.floor(Math.random() * 2000),
          description: `Week ${w + 1} groceries and dining`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 3 + (w * 7))
        });
      }

      // Transport
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Transport',
        amount: 3500 + Math.floor(Math.random() * 1500),
        description: 'Metro pass and cab rides',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 2)
      });

      // Shopping (some months)
      if (m % 2 === 1) {
        transactions.push({
          userId: regularUser._id,
          type: 'expense',
          category: 'Shopping',
          amount: 4000 + Math.floor(Math.random() * 6000),
          description: 'Clothing and accessories',
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20)
        });
      }

      // Entertainment
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Entertainment',
        amount: 1500 + Math.floor(Math.random() * 2000),
        description: 'Movies, subscriptions, and outings',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 12)
      });

      // Healthcare (occasional)
      if (m === 3 || m === 0) {
        transactions.push({
          userId: regularUser._id,
          type: 'expense',
          category: 'Healthcare',
          amount: 2000 + Math.floor(Math.random() * 3000),
          description: 'Doctor visit and medicines',
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 18)
        });
      }

      // Subscriptions
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Subscriptions',
        amount: 1200,
        description: 'Netflix, Spotify, cloud storage',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      });

      // Investment
      transactions.push({
        userId: regularUser._id,
        type: 'expense',
        category: 'Savings',
        amount: 10000 + Math.floor(Math.random() * 5000),
        description: 'SIP and mutual fund investment',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10)
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`${transactions.length} transactions created for Rahul`);

    // Create transactions for Priya
    const priyaTransactions = [];
    for (let m = 3; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

      priyaTransactions.push({
        userId: user2._id,
        type: 'income',
        category: 'Salary',
        amount: 55000,
        description: 'Monthly salary',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      });

      priyaTransactions.push({
        userId: user2._id,
        type: 'expense',
        category: 'Rent',
        amount: 15000,
        description: 'Apartment rent',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5)
      });

      priyaTransactions.push({
        userId: user2._id,
        type: 'expense',
        category: 'Food',
        amount: 8000 + Math.floor(Math.random() * 3000),
        description: 'Monthly food expenses',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10)
      });

      priyaTransactions.push({
        userId: user2._id,
        type: 'expense',
        category: 'Transport',
        amount: 2500,
        description: 'Transport expenses',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 3)
      });

      priyaTransactions.push({
        userId: user2._id,
        type: 'expense',
        category: 'Savings',
        amount: 8000,
        description: 'Monthly savings',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 7)
      });
    }

    await Transaction.insertMany(priyaTransactions);
    console.log(`${priyaTransactions.length} transactions created for Priya`);

    // Create habits for Rahul
    const habits = [
      {
        userId: regularUser._id,
        name: 'Track Daily Expenses',
        description: 'Log all expenses at the end of each day',
        frequency: 'daily',
        category: 'tracking',
        completions: generateCompletions(30, 0.85),
        currentStreak: 7,
        bestStreak: 14,
        isActive: true
      },
      {
        userId: regularUser._id,
        name: 'Save ₹500 Daily',
        description: 'Put aside ₹500 every day into savings',
        frequency: 'daily',
        category: 'saving',
        completions: generateCompletions(25, 0.7),
        currentStreak: 5,
        bestStreak: 12,
        isActive: true
      },
      {
        userId: regularUser._id,
        name: 'Review Weekly Budget',
        description: 'Compare weekly spending against budget every Sunday',
        frequency: 'weekly',
        category: 'budgeting',
        completions: generateCompletions(8, 0.9),
        currentStreak: 3,
        bestStreak: 6,
        isActive: true
      },
      {
        userId: regularUser._id,
        name: 'Monthly Investment Review',
        description: 'Review and rebalance investment portfolio',
        frequency: 'monthly',
        category: 'investing',
        completions: generateCompletions(4, 1),
        currentStreak: 4,
        bestStreak: 4,
        isActive: true
      },
      {
        userId: regularUser._id,
        name: 'Read Financial News',
        description: 'Read at least one financial article daily',
        frequency: 'daily',
        category: 'learning',
        completions: generateCompletions(20, 0.6),
        currentStreak: 2,
        bestStreak: 8,
        isActive: true
      }
    ];

    await Habit.insertMany(habits);
    console.log('5 habits created for Rahul');

    // Create habits for Priya
    const priyaHabits = [
      {
        userId: user2._id,
        name: 'No-Spend Challenge',
        description: 'Avoid unnecessary spending 3 days a week',
        frequency: 'weekly',
        category: 'budgeting',
        completions: generateCompletions(6, 0.8),
        currentStreak: 2,
        bestStreak: 4,
        isActive: true
      },
      {
        userId: user2._id,
        name: 'Automate Savings',
        description: 'Ensure automatic transfer to savings account monthly',
        frequency: 'monthly',
        category: 'saving',
        completions: generateCompletions(3, 1),
        currentStreak: 3,
        bestStreak: 3,
        isActive: true
      }
    ];

    await Habit.insertMany(priyaHabits);
    console.log('2 habits created for Priya');

    // Create savings goals for Rahul
    const goals = [
      {
        userId: regularUser._id,
        name: 'Emergency Fund',
        targetAmount: 300000,
        currentAmount: 185000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        category: 'Emergency Fund',
        priority: 'high',
        contributions: generateContributions(185000, 8)
      },
      {
        userId: regularUser._id,
        name: 'Goa Vacation',
        targetAmount: 50000,
        currentAmount: 32000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 3, 1),
        category: 'Vacation',
        priority: 'medium',
        contributions: generateContributions(32000, 4)
      },
      {
        userId: regularUser._id,
        name: 'MacBook Pro Fund',
        targetAmount: 200000,
        currentAmount: 78000,
        deadline: new Date(now.getFullYear() + 1, 0, 1),
        category: 'Gadgets',
        priority: 'low',
        contributions: generateContributions(78000, 6)
      },
      {
        userId: regularUser._id,
        name: 'House Down Payment',
        targetAmount: 1000000,
        currentAmount: 245000,
        deadline: new Date(now.getFullYear() + 2, 0, 1),
        category: 'Home',
        priority: 'high',
        contributions: generateContributions(245000, 10)
      }
    ];

    await SavingsGoal.insertMany(goals);
    console.log('4 savings goals created for Rahul');

    // Create savings goals for Priya
    const priyaGoals = [
      {
        userId: user2._id,
        name: 'Emergency Fund',
        targetAmount: 200000,
        currentAmount: 95000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 8, 1),
        category: 'Emergency Fund',
        priority: 'high',
        contributions: generateContributions(95000, 5)
      },
      {
        userId: user2._id,
        name: 'Professional Course',
        targetAmount: 80000,
        currentAmount: 40000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
        category: 'Education',
        priority: 'medium',
        contributions: generateContributions(40000, 4)
      }
    ];

    await SavingsGoal.insertMany(priyaGoals);
    console.log('2 savings goals created for Priya');

    console.log('\n--- Seed Complete ---');
    console.log('Admin login: admin@fintrack.com / admin123');
    console.log('User login: rahul@example.com / password123');
    console.log('User login: priya@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

// Helper: Generate completion dates
function generateCompletions(count, consistency) {
  const completions = [];
  const now = new Date();
  
  for (let i = count; i >= 1; i--) {
    if (Math.random() < consistency) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      completions.push({ date, note: '' });
    }
  }
  return completions;
}

// Helper: Generate contributions
function generateContributions(totalAmount, count) {
  const contributions = [];
  const now = new Date();
  const amountPer = Math.floor(totalAmount / count);
  
  for (let i = count; i >= 1; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const variation = Math.floor(amountPer * 0.2 * (Math.random() - 0.5));
    contributions.push({
      amount: amountPer + variation,
      date,
      note: `Monthly contribution`
    });
  }
  return contributions;
}

seedData();
