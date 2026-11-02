import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db, seedRealisticData } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // 1. Profile Routes
  app.get('/api/profile', (_req: Request, res: Response) => {
    try {
      const profile = db.prepare('SELECT * FROM profile WHERE id = ?').get('student_profile');
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    try {
      const { name, email, college, student_id, course, year_of_study, currency, monthly_budget, warning_threshold } = req.body;
      
      db.prepare(`
        UPDATE profile SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          college = COALESCE(?, college),
          student_id = COALESCE(?, student_id),
          course = COALESCE(?, course),
          year_of_study = COALESCE(?, year_of_study),
          currency = COALESCE(?, currency),
          monthly_budget = COALESCE(?, monthly_budget),
          warning_threshold = COALESCE(?, warning_threshold),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 'student_profile'
      `).run(name, email, college, student_id, course, year_of_study, currency, monthly_budget, warning_threshold);

      // Also update overall budget in budgets table for current month if provided
      if (monthly_budget !== undefined) {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        db.prepare(`
          INSERT INTO budgets (id, month, category, amount, updated_at)
          VALUES (?, ?, 'TOTAL', ?, datetime('now'))
          ON CONFLICT(month, category) DO UPDATE SET amount = excluded.amount, updated_at = datetime('now')
        `).run(`${currentMonthStr}-TOTAL`, currentMonthStr, monthly_budget);
      }

      const updated = db.prepare('SELECT * FROM profile WHERE id = ?').get('student_profile');
      res.json({ success: true, data: updated, message: 'Profile updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Transactions Routes
  app.get('/api/transactions', (req: Request, res: Response) => {
    try {
      const { type, category, search, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];

      if (type && type !== 'all') {
        query += ' AND type = ?';
        params.push(type);
      }

      if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (title LIKE ? OR notes LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }

      // Safe sorting
      const safeSortField = sortBy === 'amount' ? 'amount' : 'date';
      const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${safeSortField} ${safeSortOrder}, created_at DESC`;

      const transactions = db.prepare(query).all(...params);
      res.json({ success: true, data: transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    try {
      const { title, amount, type, category, date, payment_method, notes } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Description is required' });
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
      }
      if (!type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Valid type (income or expense) is required' });
      }
      if (!category) {
        return res.status(400).json({ success: false, error: 'Category is required' });
      }

      const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const txDate = date || new Date().toISOString().split('T')[0];
      const method = payment_method || 'UPI / Google Pay';

      db.prepare(`
        INSERT INTO transactions (id, title, amount, type, category, date, payment_method, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(id, title.trim(), numAmount, type, category, txDate, method, notes || '');

      const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: created, message: 'Transaction recorded successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/transactions/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, amount, type, category, date, payment_method, notes } = req.body;

      const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }

      const numAmount = amount !== undefined ? parseFloat(amount) : (existing as any).amount;
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Amount must be greater than zero' });
      }

      db.prepare(`
        UPDATE transactions SET
          title = COALESCE(?, title),
          amount = ?,
          type = COALESCE(?, type),
          category = COALESCE(?, category),
          date = COALESCE(?, date),
          payment_method = COALESCE(?, payment_method),
          notes = COALESCE(?, notes)
        WHERE id = ?
      `).run(title, numAmount, type, category, date, payment_method, notes, id);

      const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      res.json({ success: true, data: updated, message: 'Transaction updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Budgets Routes
  app.get('/api/budgets', (req: Request, res: Response) => {
    try {
      const now = new Date();
      const currentMonthDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const month = (req.query.month as string) || currentMonthDefault;

      // Get profile overall budget and threshold
      const profile = db.prepare('SELECT monthly_budget, warning_threshold FROM profile WHERE id = ?').get('student_profile') as any;
      const warningThreshold = profile?.warning_threshold ?? 80;

      // Fetch saved budgets for this month
      const budgets = db.prepare('SELECT * FROM budgets WHERE month = ?').all(month) as any[];

      // Fetch expenses for this month grouped by category
      const expenseRows = db.prepare(`
        SELECT category, SUM(amount) as spent
        FROM transactions
        WHERE type = 'expense' AND date LIKE ?
        GROUP BY category
      `).all(`${month}%`) as { category: string; spent: number }[];

      const spentMap: Record<string, number> = {};
      let totalSpent = 0;
      for (const row of expenseRows) {
        spentMap[row.category] = row.spent;
        totalSpent += row.spent;
      }

      // Defined expense categories
      const standardCategories = [
        'Food and Snacks',
        'Transportation',
        'Books and Stationery',
        'College Fees',
        'Accommodation',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Other'
      ];

      // Overall monthly budget
      const totalBudgetRow = budgets.find((b: any) => b.category === 'TOTAL');
      const overallBudgetAmount = totalBudgetRow ? totalBudgetRow.amount : (profile?.monthly_budget ?? 22000);
      const overallRemaining = overallBudgetAmount - totalSpent;
      const overallPercentage = overallBudgetAmount > 0 ? (totalSpent / overallBudgetAmount) * 100 : 0;

      // Category breakdown
      const categoryBudgets = standardCategories.map(cat => {
        const foundBudget = budgets.find((b: any) => b.category === cat);
        const budgetAmount = foundBudget ? foundBudget.amount : 0;
        const spent = spentMap[cat] || 0;
        const remaining = budgetAmount - spent;
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        let status = 'normal';
        if (budgetAmount > 0) {
          if (percentage >= 100) {
            status = 'exceeded';
          } else if (percentage >= warningThreshold) {
            status = 'warning';
          }
        }

        return {
          category: cat,
          budget: budgetAmount,
          spent,
          remaining,
          percentage: Number(percentage.toFixed(1)),
          status
        };
      });

      res.json({
        success: true,
        data: {
          month,
          overall: {
            budget: overallBudgetAmount,
            spent: totalSpent,
            remaining: overallRemaining,
            percentage: Number(overallPercentage.toFixed(1)),
            warningThreshold,
            status: overallPercentage >= 100 ? 'exceeded' : (overallPercentage >= warningThreshold ? 'warning' : 'normal')
          },
          categories: categoryBudgets
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/budgets', (req: Request, res: Response) => {
    try {
      const { month, category, amount } = req.body;
      if (!month || !category || amount === undefined) {
        return res.status(400).json({ success: false, error: 'Month, category, and amount are required' });
      }

      const numAmount = Math.max(0, parseFloat(amount));
      const id = `${month}-${category}`;

      db.prepare(`
        INSERT INTO budgets (id, month, category, amount, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(month, category) DO UPDATE SET amount = excluded.amount, updated_at = datetime('now')
      `).run(id, month, category, numAmount);

      // If category is TOTAL, also update profile's monthly_budget
      if (category === 'TOTAL') {
        db.prepare('UPDATE profile SET monthly_budget = ? WHERE id = ?').run(numAmount, 'student_profile');
      }

      res.json({ success: true, message: `Budget for ${category} updated to ₹${numAmount}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Analytics & Dashboard Summary
  app.get('/api/analytics', (req: Request, res: Response) => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonthStr = `${currentYear}-${currentMonth}`;

      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

      // Current month calculations
      const currentIncome = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE ?
      `).get(`${currentMonthStr}%`) as any).total;

      const currentExpense = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ?
      `).get(`${currentMonthStr}%`) as any).total;

      // Previous month calculations
      const prevIncome = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE ?
      `).get(`${prevMonthStr}%`) as any).total;

      const prevExpense = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ?
      `).get(`${prevMonthStr}%`) as any).total;

      // Total balance (all-time income - all-time expenses)
      const allIncome = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'
      `).get() as any).total;

      const allExpense = (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'
      `).get() as any).total;

      const totalBalance = allIncome - allExpense;

      // Budget
      const profile = db.prepare('SELECT monthly_budget, warning_threshold FROM profile WHERE id = ?').get('student_profile') as any;
      const budgetRow = db.prepare('SELECT amount FROM budgets WHERE month = ? AND category = ?').get(currentMonthStr, 'TOTAL') as any;
      const monthlyBudget = budgetRow ? budgetRow.amount : (profile?.monthly_budget ?? 22000);
      const remainingBudget = monthlyBudget - currentExpense;
      const budgetUsagePercentage = monthlyBudget > 0 ? (currentExpense / monthlyBudget) * 100 : 0;

      // Category breakdown for current month
      const categoryBreakdown = db.prepare(`
        SELECT category, SUM(amount) as amount, COUNT(*) as count
        FROM transactions
        WHERE type = 'expense' AND date LIKE ?
        GROUP BY category
        ORDER BY amount DESC
      `).all(`${currentMonthStr}%`) as any[];

      // Monthly Income vs Expense (last 6 months)
      const monthlyTrends: { month: string; monthLabel: string; income: number; expense: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('en-US', { month: 'short' });

        const inc = (db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date LIKE ?
        `).get(`${mStr}%`) as any).total;

        const exp = (db.prepare(`
          SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ?
        `).get(`${mStr}%`) as any).total;

        monthlyTrends.push({
          month: mStr,
          monthLabel: label,
          income: inc,
          expense: exp
        });
      }

      // Daily spending trend in current month (cumulative)
      const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
      const dailyExpenses = db.prepare(`
        SELECT date, SUM(amount) as amount
        FROM transactions
        WHERE type = 'expense' AND date LIKE ?
        GROUP BY date
        ORDER BY date ASC
      `).all(`${currentMonthStr}%`) as { date: string; amount: number }[];

      const dailyMap: Record<string, number> = {};
      dailyExpenses.forEach(d => {
        dailyMap[d.date] = d.amount;
      });

      let cumulative = 0;
      const spendingTrend = [];
      const currentDay = now.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
        const dailyAmt = dailyMap[dayStr] || 0;
        cumulative += dailyAmt;
        if (day <= currentDay || dailyAmt > 0) {
          spendingTrend.push({
            day,
            date: dayStr,
            daily: dailyAmt,
            cumulative
          });
        }
      }

      // Recent 5 transactions
      const recentTransactions = db.prepare(`
        SELECT * FROM transactions
        ORDER BY date DESC, created_at DESC
        LIMIT 6
      `).all();

      res.json({
        success: true,
        data: {
          totalBalance,
          currentMonth: {
            month: currentMonthStr,
            income: currentIncome,
            expense: currentExpense,
            monthlyBudget,
            remainingBudget,
            budgetUsagePercentage: Number(budgetUsagePercentage.toFixed(1)),
            warningThreshold: profile?.warning_threshold ?? 80
          },
          comparison: {
            prevMonth: prevMonthStr,
            prevIncome,
            prevExpense,
            expenseDelta: currentExpense - prevExpense,
            expenseDeltaPercent: prevExpense > 0 ? Number((((currentExpense - prevExpense) / prevExpense) * 100).toFixed(1)) : 0,
            incomeDelta: currentIncome - prevIncome,
            incomeDeltaPercent: prevIncome > 0 ? Number((((currentIncome - prevIncome) / prevIncome) * 100).toFixed(1)) : 0
          },
          categoryBreakdown,
          monthlyTrends,
          spendingTrend,
          recentTransactions
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. CSV Export Route
  app.get('/api/export', (_req: Request, res: Response) => {
    try {
      const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all() as any[];
      const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
      const rows = transactions.map(t => [
        t.id,
        t.date,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.payment_method || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="student_expenses_export.csv"');
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Reset Demo Data
  app.post('/api/demo-data', (_req: Request, res: Response) => {
    try {
      seedRealisticData(true);
      res.json({ success: true, message: 'Sample college transactions and budgets reloaded successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // VITE / STATIC SERVING
  // ----------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Student Expense Tracker running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
