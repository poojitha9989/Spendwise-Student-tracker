import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  PieChart as PieIcon,
  BarChart2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import {
  AnalyticsData,
  StudentProfile,
  Transaction,
  CATEGORY_COLORS
} from '../types';
import { formatCurrency, api } from '../services/api';
import { IncomeExpenseBarChart } from './charts/IncomeExpenseBarChart';
import { CategoryDoughnutChart } from './charts/CategoryDoughnutChart';
import { SpendingTrendLineChart } from './charts/SpendingTrendLineChart';

interface Props {
  analytics: AnalyticsData;
  transactions: Transaction[];
  profile: StudentProfile | null;
}

export const ReportsView: React.FC<Props> = ({ analytics, transactions, profile }) => {
  const currency = profile?.currency || '₹';
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  // Filter transactions according to selected period
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  const periodTransactions = useMemo(() => {
    if (period === 'month') {
      return transactions.filter(t => t.date.startsWith(currentMonthStr));
    } else if (period === 'year') {
      return transactions.filter(t => t.date.startsWith(currentYearStr));
    }
    return transactions;
  }, [transactions, period, currentMonthStr, currentYearStr]);

  // Aggregate stats for chosen period
  const totalIncome = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const totalExpense = useMemo(() => {
    return periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  // Category breakdown for chosen period
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    periodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!map[t.category]) map[t.category] = { amount: 0, count: 0 };
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      });

    return Object.entries(map)
      .map(([category, val]) => ({
        category,
        amount: val.amount,
        count: val.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  const comp = analytics.comparison;

  const handleExportCSV = () => {
    window.location.href = api.exportCSVUrl();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Audit your spending trends, monthly variance, and student cash-flow distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector Tabs */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                period === 'month' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                period === 'year' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                period === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Period High-Level Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
          <div className="mt-2 text-xl font-bold text-slate-900 font-tabular">
            {formatCurrency(totalIncome, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scholarships, allowances & jobs</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Outflow</span>
          <div className="mt-2 text-xl font-bold text-slate-900 font-tabular">
            {formatCurrency(totalExpense, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{periodTransactions.filter(t => t.type === 'expense').length} logged purchases</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Surplus / Deficit</span>
          <div className={`mt-2 text-xl font-bold font-tabular ${netSavings >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
            {formatCurrency(netSavings, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Income minus living costs</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Savings Retention Rate</span>
          <div className="mt-2 text-xl font-bold text-slate-900 font-tabular">
            {savingsRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Portion retained for future savings</p>
        </div>
      </div>

      {/* Month-over-Month Comparative Analysis Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Comparative Analysis
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Current Month vs. Previous Month Performance
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Comparison between current active cycle ({analytics.currentMonth.month}) and previous cycle ({comp.prevMonth})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">Monthly Outflow Delta</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-base font-bold font-tabular ${comp.expenseDelta > 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                {comp.expenseDelta >= 0 ? '+' : ''}{formatCurrency(comp.expenseDelta, currency)}
              </span>
              <span className="text-xs text-slate-400">
                ({comp.expenseDeltaPercent}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {comp.expenseDelta > 0 ? 'Spending increased vs last month' : 'Spending reduced vs last month'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">Monthly Inflow Delta</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-base font-bold font-tabular ${comp.incomeDelta >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {comp.incomeDelta >= 0 ? '+' : ''}{formatCurrency(comp.incomeDelta, currency)}
              </span>
              <span className="text-xs text-slate-400">
                ({comp.incomeDeltaPercent}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Income variation</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">Last Month Outflow</span>
            <div className="mt-1 text-base font-bold text-white font-tabular">
              {formatCurrency(comp.prevExpense, currency)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Baseline expense benchmark</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">Last Month Inflow</span>
            <div className="mt-1 text-base font-bold text-white font-tabular">
              {formatCurrency(comp.prevIncome, currency)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Baseline income received</span>
          </div>
        </div>
      </div>

      {/* Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Semi-Annual Cash Flow Trajectory</h3>
              <p className="text-xs text-slate-500">Side-by-side monthly income vs expenses (6-month horizon)</p>
            </div>
          </div>
          <IncomeExpenseBarChart trends={analytics.monthlyTrends} currency={currency} />
        </div>

        {/* Category Breakdown Doughnut */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Outflow Distribution</h3>
              <p className="text-xs text-slate-500">Expenses by category for {period === 'month' ? 'this month' : period === 'year' ? 'this year' : 'all time'}</p>
            </div>
          </div>
          <CategoryDoughnutChart
            breakdown={categoryBreakdown}
            currency={currency}
            totalExpense={totalExpense}
          />
        </div>
      </div>

      {/* Highest-Spending Categories Leaderboard */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Highest-Spending Categories Leaderboard</h3>
              <p className="text-xs text-slate-500">Ranked by total expenditures during the selected timeframe</p>
            </div>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">No expense records found for this period</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((item, idx) => {
              const catStyle = CATEGORY_COLORS[item.category];
              const pct = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : '0';

              return (
                <div
                  key={item.category}
                  className="p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold font-tabular text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: catStyle?.hex || '#94A3B8' }}
                      />
                      <span className="font-bold text-slate-900">{item.category}</span>
                      <span className="text-slate-400 text-[11px]">({item.count} entries)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 font-tabular">
                        {formatCurrency(item.amount, currency)}
                      </span>
                      <span className="font-tabular font-semibold text-slate-500 w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: catStyle?.hex || '#0D9488'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
