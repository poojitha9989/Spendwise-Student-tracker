import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Percent,
  Plus,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag
} from 'lucide-react';
import { AnalyticsData, StudentProfile, CATEGORY_COLORS } from '../types';
import { formatCurrency } from '../services/api';
import { IncomeExpenseBarChart } from './charts/IncomeExpenseBarChart';
import { CategoryDoughnutChart } from './charts/CategoryDoughnutChart';
import { SpendingTrendLineChart } from './charts/SpendingTrendLineChart';

interface Props {
  data: AnalyticsData;
  profile: StudentProfile | null;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  onOpenBudgetModal: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  data,
  profile,
  onOpenAddModal,
  onOpenBudgetModal,
  onNavigate,
}) => {
  const currency = profile?.currency || '₹';
  const current = data.currentMonth;
  const budgetUsage = current.budgetUsagePercentage;
  const warningThreshold = current.warningThreshold || 80;

  const isOverBudget = budgetUsage >= 100;
  const isNearBudget = budgetUsage >= warningThreshold && !isOverBudget;

  return (
    <div className="space-y-6">
      {/* Budget Warning / Overdue Banner if applicable */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Monthly Spending Limit Exceeded!
              </h4>
              <p className="text-xs text-rose-700">
                You have spent {formatCurrency(current.expense, currency)} of your {formatCurrency(current.monthlyBudget, currency)} budget ({budgetUsage}%). Consider reviewing unnecessary expenditures.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {isNearBudget && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Budget Alert: {budgetUsage}% Limit Consumed
              </h4>
              <p className="text-xs text-amber-700">
                You have {formatCurrency(current.remainingBudget, currency)} remaining for this month before hitting your spending threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('budgets')}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Smart College Budgeting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Hello, {profile?.name || 'Aryan'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            You have managed {data.categoryBreakdown.length} expense categories this month. Keep your student living costs on track.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-950/20 whitespace-nowrap"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => onOpenAddModal('income')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-950/20 whitespace-nowrap"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all whitespace-nowrap"
          >
            <Target className="w-4 h-4 text-teal-400" />
            <span>Set Budget</span>
          </button>
        </div>

        {/* Decorative subtle gradient background */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {formatCurrency(data.totalBalance, currency)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>All-time balance</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-600 font-medium font-tabular">Active</span>
            </div>
          </div>
        </div>

        {/* Total Income This Month */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {formatCurrency(current.income, currency)}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 font-medium font-tabular">
                {data.comparison.incomeDelta >= 0 ? '+' : ''}{data.comparison.incomeDeltaPercent}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Expenses This Month */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {formatCurrency(current.expense, currency)}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className={`font-medium font-tabular ${data.comparison.expenseDelta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {data.comparison.expenseDelta >= 0 ? '+' : ''}{data.comparison.expenseDeltaPercent}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Remaining Budget & Usage */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining Budget</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-tabular ${current.remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatCurrency(current.remainingBudget, currency)}
              </span>
              <span className="text-xs font-semibold font-tabular text-slate-600">
                {budgetUsage}% used
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearBudget
                    ? 'bg-amber-400'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Cap: {formatCurrency(current.monthlyBudget, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Income vs. Expenses</h3>
              <p className="text-xs text-slate-500">Historical performance over the past 6 months</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <IncomeExpenseBarChart trends={data.monthlyTrends} currency={currency} />
        </div>

        {/* Category-wise Spending Doughnut Chart (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
                <p className="text-xs text-slate-500">Distribution for current month</p>
              </div>
            </div>
            <CategoryDoughnutChart
              breakdown={data.categoryBreakdown}
              currency={currency}
              totalExpense={current.expense}
            />
          </div>
        </div>
      </div>

      {/* Row: Cumulative Spending Trend & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Daily Spending Line Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Spending Trajectory</h3>
              <p className="text-xs text-slate-500">Cumulative day-by-day expenditure vs your budget cap</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-0.5 bg-teal-600 rounded" />
              <span>Spending</span>
              <span className="w-2.5 h-0.5 bg-slate-400 rounded border-dashed" />
              <span>Budget Cap</span>
            </div>
          </div>
          <SpendingTrendLineChart
            points={data.spendingTrend}
            monthlyBudget={current.monthlyBudget}
            currency={currency}
          />
        </div>

        {/* Recent Transactions (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Latest wallet movements</p>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {data.recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>No transactions logged yet</p>
                  <button
                    onClick={() => onOpenAddModal('expense')}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 rounded-lg"
                  >
                    Log First Expense
                  </button>
                </div>
              ) : (
                data.recentTransactions.map((tx) => {
                  const isExp = tx.type === 'expense';
                  const catStyle = CATEGORY_COLORS[tx.category];
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isExp ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                          {isExp ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {tx.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{tx.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{tx.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold font-tabular shrink-0 ${isExp ? 'text-slate-900' : 'text-teal-600'}`}>
                        {isExp ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Record New Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};
