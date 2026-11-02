import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  BarChart3,
  Settings,
  GraduationCap,
  X,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../services/api';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  monthlySpent: number;
  monthlyBudget: number;
  currency?: string;
  warningThreshold?: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  monthlySpent,
  monthlyBudget,
  currency = '₹',
  warningThreshold = 80,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const budgetPct = monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetPct >= 100;
  const isNearBudget = budgetPct >= warningThreshold && !isOverBudget;

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                CampusSpend
              </h1>
              <p className="text-[11px] text-teal-400 font-medium mt-1">Student Expense Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Monthly Budget Mini-Status */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Monthly Cap</span>
              <span className="font-tabular font-bold text-white">
                {Math.round(budgetPct)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700/70 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearBudget
                    ? 'bg-amber-400'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, budgetPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-tabular">
              <span>{formatCurrency(monthlySpent, currency)}</span>
              <span>{formatCurrency(monthlyBudget, currency)}</span>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Over budget by {formatCurrency(monthlySpent - monthlyBudget, currency)}</span>
              </div>
            )}
            {isNearBudget && (
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{warningThreshold}% limit reached</span>
              </div>
            )}
          </div>

          <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>NIT Student Edition</span>
            <span>v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
