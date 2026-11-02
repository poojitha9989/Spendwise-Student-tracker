import React, { useState, useEffect } from 'react';
import { X, Target, Plus, ShieldCheck } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (month: string, category: string, amount: number) => Promise<void>;
  currentMonth: string;
  category?: string;
  initialAmount?: number;
  currency?: string;
}

export const BudgetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  currentMonth,
  category = 'TOTAL',
  initialAmount = 22000,
  currency = '₹'
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [amount, setAmount] = useState(initialAmount.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedMonth(currentMonth);
    setSelectedCategory(category);
    setAmount(initialAmount ? initialAmount.toString() : '5000');
    setError('');
  }, [isOpen, currentMonth, category, initialAmount]);

  if (!isOpen) return null;

  const handleAddPreset = (delta: number) => {
    const curr = parseFloat(amount) || 0;
    setAmount(String(Math.max(0, curr + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(selectedMonth, selectedCategory, numAmount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const isOverall = selectedCategory === 'TOTAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {isOverall ? 'Set Monthly Spending Limit' : `Budget for ${selectedCategory}`}
              </h2>
              <p className="text-xs text-slate-400">Month: {selectedMonth}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="TOTAL">🎯 Overall Monthly Limit (Total Cap)</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Budget Target Amount ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-tabular font-medium text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                required
                min="100"
                placeholder="20000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            
            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">Quick Add:</span>
              <button
                type="button"
                onClick={() => handleAddPreset(500)}
                className="px-2 py-0.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> {currency}500
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset(1000)}
                className="px-2 py-0.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> {currency}1,000
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset(5000)}
                className="px-2 py-0.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> {currency}5,000
              </button>
            </div>
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-900">
              When spending approaches 80% of this budget, an in-app warning will trigger. Overspending alerts activate at 100%.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
