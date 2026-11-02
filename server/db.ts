import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'student_tracker.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT NOT NULL,
    student_id TEXT NOT NULL,
    course TEXT DEFAULT 'B.Tech Computer Science',
    year_of_study TEXT DEFAULT '3rd Year',
    currency TEXT DEFAULT '₹',
    monthly_budget REAL DEFAULT 20000,
    warning_threshold REAL DEFAULT 80,
    avatar_url TEXT DEFAULT '',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, category)
  );
`);

// Ensure default profile exists
const existingProfile = db.prepare('SELECT * FROM profile WHERE id = ?').get('student_profile');
if (!existingProfile) {
  db.prepare(`
    INSERT INTO profile (id, name, email, college, student_id, course, year_of_study, currency, monthly_budget, warning_threshold, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'student_profile',
    'Aryan Sharma',
    'aryan.sharma@campus.edu.in',
    'National Institute of Technology',
    'NIT-2024-CS089',
    'B.Tech Computer Science & Eng.',
    '3rd Year / Sem 5',
    '₹',
    22000,
    80,
    '/src/assets/images/student_avatar_1793194127558.jpg'
  );
}

// Function to seed realistic demo transactions
export function seedRealisticData(force = false) {
  const count = (db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number }).count;
  if (count > 0 && !force) {
    return;
  }

  if (force) {
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM budgets').run();
  }

  // Current year & month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  
  // Last month
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Default monthly category budgets for current month
  const defaultCategoryBudgets: [string, number][] = [
    ['TOTAL', 22000],
    ['Food and Snacks', 6500],
    ['Transportation', 2000],
    ['Books and Stationery', 2500],
    ['College Fees', 3000],
    ['Accommodation', 4500],
    ['Shopping', 2500],
    ['Entertainment', 2000],
    ['Healthcare', 1500],
    ['Other', 1000]
  ];

  const insertBudget = db.prepare(`
    INSERT OR REPLACE INTO budgets (id, month, category, amount, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, title, amount, type, category, date, payment_method, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // Seed budgets for current month and previous month
  for (const [cat, amt] of defaultCategoryBudgets) {
    insertBudget.run(`${currentMonthStr}-${cat}`, currentMonthStr, cat, amt);
    insertBudget.run(`${prevMonthStr}-${cat}`, prevMonthStr, cat, amt);
  }

  const sampleTransactions = [
    // Income this month
    { id: 'tx-01', title: 'Monthly Pocket Money from Parents', amount: 18000, type: 'income', category: 'Pocket Money', date: `${currentMonthStr}-01`, payment_method: 'UPI / Google Pay', notes: 'Monthly living allowance' },
    { id: 'tx-02', title: 'Campus Lab Assistant Stipend', amount: 6500, type: 'income', category: 'Part-time Job', date: `${currentMonthStr}-05`, payment_method: 'Net Banking', notes: 'Python programming tutor hours' },
    { id: 'tx-03', title: 'Merit Scholarship Installment', amount: 5000, type: 'income', category: 'Scholarship', date: `${currentMonthStr}-12`, payment_method: 'Net Banking', notes: 'Semester 4 academic excellence grant' },
    
    // Expenses this month
    { id: 'tx-04', title: 'College Hostel Mess & Food Card', amount: 3800, type: 'expense', category: 'Food and Snacks', date: `${currentMonthStr}-02`, payment_method: 'UPI / Google Pay', notes: 'Monthly mess subscription recharge' },
    { id: 'tx-05', title: 'Campus Transit Pass & Metro Card', amount: 1200, type: 'expense', category: 'Transportation', date: `${currentMonthStr}-03`, payment_method: 'Debit Card', notes: 'Monthly unlimited student travel card' },
    { id: 'tx-06', title: 'Algorithms & System Design Textbooks', amount: 1850, type: 'expense', category: 'Books and Stationery', date: `${currentMonthStr}-04`, payment_method: 'UPI / Google Pay', notes: 'Reference books from campus bookstore' },
    { id: 'tx-07', title: 'Hostel Maintenance & Electricity Share', amount: 2200, type: 'expense', category: 'Accommodation', date: `${currentMonthStr}-06`, payment_method: 'Net Banking', notes: 'Room shared utilities' },
    { id: 'tx-08', title: 'Cafeteria Evening Snacks & Chai', amount: 420, type: 'expense', category: 'Food and Snacks', date: `${currentMonthStr}-08`, payment_method: 'Cash', notes: 'Group study session treats' },
    { id: 'tx-09', title: 'Laboratory Examination Fee', amount: 1500, type: 'expense', category: 'College Fees', date: `${currentMonthStr}-10`, payment_method: 'Net Banking', notes: 'Semester mid-term practicals registration' },
    { id: 'tx-10', title: 'Weekend Movie & Dinner Outing', amount: 1250, type: 'expense', category: 'Entertainment', date: `${currentMonthStr}-14`, payment_method: 'UPI / Google Pay', notes: 'Celebrated project completion with hostel mates' },
    { id: 'tx-11', title: 'Pharmacy & Health Checkup Medicines', amount: 680, type: 'expense', category: 'Healthcare', date: `${currentMonthStr}-16`, payment_method: 'Cash', notes: 'Vitamin supplements and eye drops' },
    { id: 'tx-12', title: 'College Sports Jersey & Sneakers', amount: 1950, type: 'expense', category: 'Shopping', date: `${currentMonthStr}-18`, payment_method: 'Credit Card', notes: 'Annual inter-college athletic meet gear' },
    { id: 'tx-13', title: 'Library Photocopier & Spiral Binding', amount: 260, type: 'expense', category: 'Books and Stationery', date: `${currentMonthStr}-20`, payment_method: 'UPI / Google Pay', notes: 'Project submission documentation' },
    { id: 'tx-14', title: 'Late Night Canteen Pizza & Beverages', amount: 740, type: 'expense', category: 'Food and Snacks', date: `${currentMonthStr}-22`, payment_method: 'UPI / Google Pay', notes: 'Hackathon preparation dinner' },
    { id: 'tx-15', title: 'Emergency Auto-rickshaw to Railway Station', amount: 350, type: 'expense', category: 'Transportation', date: `${currentMonthStr}-24`, payment_method: 'Cash', notes: 'Weekend trip home' },

    // Previous month historical transactions for rich analytics & comparison
    { id: 'tx-prev-01', title: 'Pocket Money from Parents', amount: 18000, type: 'income', category: 'Pocket Money', date: `${prevMonthStr}-01`, payment_method: 'UPI / Google Pay', notes: '' },
    { id: 'tx-prev-02', title: 'Freelance Frontend Gig', amount: 8000, type: 'income', category: 'Part-time Job', date: `${prevMonthStr}-15`, payment_method: 'Net Banking', notes: '' },
    { id: 'tx-prev-03', title: 'Hostel Mess Fee', amount: 4100, type: 'expense', category: 'Food and Snacks', date: `${prevMonthStr}-02`, payment_method: 'UPI / Google Pay', notes: '' },
    { id: 'tx-prev-04', title: 'Hostel Rent', amount: 4500, type: 'expense', category: 'Accommodation', date: `${prevMonthStr}-05`, payment_method: 'Net Banking', notes: '' },
    { id: 'tx-prev-05', title: 'Semester Library Fee', amount: 1800, type: 'expense', category: 'College Fees', date: `${prevMonthStr}-10`, payment_method: 'Debit Card', notes: '' },
    { id: 'tx-prev-06', title: 'Metro Smart Card Recharge', amount: 1400, type: 'expense', category: 'Transportation', date: `${prevMonthStr}-11`, payment_method: 'UPI / Google Pay', notes: '' },
    { id: 'tx-prev-07', title: 'Casual Clothes for Fest', amount: 2100, type: 'expense', category: 'Shopping', date: `${prevMonthStr}-18`, payment_method: 'Credit Card', notes: '' },
    { id: 'tx-prev-08', title: 'Concert & Fest Entry Ticket', amount: 950, type: 'expense', category: 'Entertainment', date: `${prevMonthStr}-22`, payment_method: 'UPI / Google Pay', notes: '' }
  ];

  for (const tx of sampleTransactions) {
    insertTransaction.run(tx.id, tx.title, tx.amount, tx.type, tx.category, tx.date, tx.payment_method, tx.notes);
  }
}

// Seed on startup if needed
seedRealisticData(false);
