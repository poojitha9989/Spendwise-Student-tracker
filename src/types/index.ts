export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  payment_method: string;
  notes?: string;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  student_id: string;
  course: string;
  year_of_study: string;
  currency: string;
  monthly_budget: number;
  warning_threshold: number;
  avatar_url?: string;
  updated_at?: string;
}

export interface CategoryBudget {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface BudgetOverview {
  month: string;
  overall: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
    warningThreshold: number;
    status: 'normal' | 'warning' | 'exceeded';
  };
  categories: CategoryBudget[];
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
}

export interface SpendingTrendPoint {
  day: number;
  date: string;
  daily: number;
  cumulative: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
}

export interface AnalyticsData {
  totalBalance: number;
  currentMonth: {
    month: string;
    income: number;
    expense: number;
    monthlyBudget: number;
    remainingBudget: number;
    budgetUsagePercentage: number;
    warningThreshold: number;
  };
  comparison: {
    prevMonth: string;
    prevIncome: number;
    prevExpense: number;
    expenseDelta: number;
    expenseDeltaPercent: number;
    incomeDelta: number;
    incomeDeltaPercent: number;
  };
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrends: MonthlyTrend[];
  spendingTrend: SpendingTrendPoint[];
  recentTransactions: Transaction[];
}

export const EXPENSE_CATEGORIES = [
  'Food and Snacks',
  'Transportation',
  'Books and Stationery',
  'College Fees',
  'Accommodation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Other'
] as const;

export const INCOME_CATEGORIES = [
  'Pocket Money',
  'Scholarship',
  'Part-time Job',
  'Allowance',
  'Other'
] as const;

export const PAYMENT_METHODS = [
  'UPI / Google Pay',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other'
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'Food and Snacks': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#F59E0B' },
  'Transportation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#3B82F6' },
  'Books and Stationery': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10B981' },
  'College Fees': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#6366F1' },
  'Accommodation': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#14B8A6' },
  'Shopping': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hex: '#F43F5E' },
  'Entertainment': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#8B5CF6' },
  'Healthcare': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hex: '#06B6D4' },
  'Other': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748B' },
  
  // Income
  'Pocket Money': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#0D9488' },
  'Scholarship': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#059669' },
  'Part-time Job': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#4F46E5' },
  'Allowance': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hex: '#0284C7' }
};
