import React, { useState } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  ShieldAlert,
  PiggyBank,
  TrendingDown,
  Info
} from 'lucide-react';
import { BudgetOverview, StudentProfile, CATEGORY_COLORS } from '../types';
import { formatCurrency } from '../services/api';

interface Props {
  budgets: BudgetOverview | null;
  profile: StudentProfile | null;
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenBudgetModal: (category?: string, initialAmount?: number) => void;
  onRefresh: () => void;
}

export const BudgetsView: React.FC<Props> = ({
  budgets,
  profile,
  currentMonth,
  onMonthChange,
  onOpenBudgetModal,
  onRefresh,
}) => {
  const currency = profile?.currency || '₹';
  const overall = budgets?.overall;
  const categories = budgets?.categories || [];
  const warningThreshold = overall?.warningThreshold || 80;

  // Month navigation helper
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  // Month display label
  const [y, m] = currentMonth.split('-').map(Number);
  const monthDisplay = new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const overallBudget = overall?.budget || 22000;
  const overallSpent = overall?.spent || 0;
  const overallRemaining = overall?.remaining || (overallBudget - overallSpent);
  const overallPct = overall?.percentage || 0;

  const isOverBudget = overallPct >= 100;
  const isNearBudget = overallPct >= warningThreshold && !isOverBudget;

  // Count warning and exceeded categories
  const exceededCategories = categories.filter((c) => c.status === 'exceeded');
  const warningCategories = categories.filter((c) => c.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Budget Management</h2>
          <p className="text-xs text-slate-500">
            Set and monitor monthly limits and category allocations to avoid student debt
          </p>
        </div>

        {/* Month Selector Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-3 min-w-[120px] text-center">
            {monthDisplay}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warnings & Alerts Strip */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              Critical: Overall Monthly Budget Exceeded
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              You have spent {formatCurrency(overallSpent, currency)}, exceeding your monthly cap by {formatCurrency(overallSpent - overallBudget, currency)}.
            </p>
          </div>
          <button
            onClick={() => onOpenBudgetModal('TOTAL', overallBudget)}
            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Update Cap
          </button>
        </div>
      )}

      {!isOverBudget && isNearBudget && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Caution: 80% Threshold Reached
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              You have used {overallPct}% of your budget limit. Only {formatCurrency(overallRemaining, currency)} is left for the remaining days of {monthDisplay}.
            </p>
          </div>
          <button
            onClick={() => onOpenBudgetModal('TOTAL', overallBudget)}
            className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap"
          >
            Adjust
          </button>
        </div>
      )}

      {/* Main Overall Budget Status Card */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-xs uppercase font-semibold text-teal-300 tracking-wider">
                  Target Spending Cap · {monthDisplay}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-tabular">
                {formatCurrency(overallBudget, currency)}
              </h3>
            </div>

            <button
              onClick={() => onOpenBudgetModal('TOTAL', overallBudget)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-sm w-fit"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modify Overall Limit</span>
            </button>
          </div>

          {/* Progress Bar & Indicators */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Spent: <strong className="text-white font-tabular">{formatCurrency(overallSpent, currency)}</strong>
              </span>
              <span className="font-tabular font-bold text-teal-300">
                {overallPct}% Consumed
              </span>
              <span className="text-slate-300">
                Remaining: <strong className="text-white font-tabular">{formatCurrency(overallRemaining, currency)}</strong>
              </span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearBudget
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${Math.min(100, overallPct)}%` }}
              />
            </div>
          </div>

          {/* Micro stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Categories Monitored</span>
              <span className="font-bold text-white text-sm font-tabular">{categories.length} Categories</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Exceeded Limits</span>
              <span className={`font-bold text-sm font-tabular ${exceededCategories.length > 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                {exceededCategories.length} Categories
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Near Threshold (80%)</span>
              <span className={`font-bold text-sm font-tabular ${warningCategories.length > 0 ? 'text-amber-400' : 'text-teal-400'}`}>
                {warningCategories.length} Categories
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category Budgets</h3>
            <p className="text-xs text-slate-500">Fine-grained expense tracking for individual student necessities</p>
          </div>
          <button
            onClick={() => onOpenBudgetModal('Food and Snacks', 6500)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Edit Category Limit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((item) => {
            const catStyle = CATEGORY_COLORS[item.category];
            const hasBudget = item.budget > 0;
            const isExceeded = item.status === 'exceeded';
            const isWarn = item.status === 'warning';

            return (
              <div
                key={item.category}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: catStyle?.hex || '#94A3B8' }}
                      />
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.category}
                      </h4>
                    </div>

                    <button
                      onClick={() => onOpenBudgetModal(item.category, item.budget || 2000)}
                      className="p-1 text-slate-400 hover:text-teal-600 rounded-md hover:bg-teal-50 transition-colors"
                      title="Edit Category Budget"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Spent vs Budget amount */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900 font-tabular">
                        {formatCurrency(item.spent, currency)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">spent</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Cap: </span>
                      <span className="text-xs font-bold text-slate-800 font-tabular">
                        {hasBudget ? formatCurrency(item.budget, currency) : 'No limit'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarn
                          ? 'bg-amber-400'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Footer status & Remaining */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isExceeded ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Exceeded by {formatCurrency(Math.abs(item.remaining), currency)}
                      </span>
                    ) : isWarn ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.percentage}% used
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {hasBudget ? `${item.percentage}% on track` : 'No budget set'}
                      </span>
                    )}
                  </div>

                  {hasBudget && (
                    <span className={`font-tabular font-medium text-[11px] ${item.remaining < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {item.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(item.remaining), currency)} left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collegiate Budgeting Advice Section */}
      <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 space-y-1">
          <p className="font-bold">Student Budgeting Rule (50/30/20):</p>
          <p className="text-teal-800">
            Allocate 50% for Campus Essentials (Hostel, Mess, Transit & Books), 30% for Personal Discretionary (Snacks, Outings, Shopping), and reserve at least 20% in savings or emergency backup funds.
          </p>
        </div>
      </div>
    </div>
  );
};
