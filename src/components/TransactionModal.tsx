import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Transaction | null;
  currency?: string;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currency = '₹',
  defaultType = 'expense'
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI / Google Pay');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.payment_method);
      setNotes(initialData.notes || '');
    } else {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setCategory(defaultType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI / Google Pay');
      setNotes('');
    }
    setError('');
  }, [initialData, defaultType, isOpen]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a short description.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        payment_method: paymentMethod,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'bg-teal-500/20 text-teal-400'}`}>
              {type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {initialData ? 'Edit Transaction' : 'Record Transaction'}
              </h2>
              <p className="text-xs text-slate-400">Manage your student balance and budget logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Expense (Spent)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Income (Received)
              </button>
            </div>
          </div>

          {/* Amount & Date in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-tabular font-medium text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Payee *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder={type === 'expense' ? 'e.g., Cafeteria lunch, Data structure book, Metro pass' : 'e.g., Pocket money from dad, Lab assistant gig'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split with room-mate, receipt saved, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Action Buttons */}
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
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20'
                  : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500/20'
              } disabled:opacity-50`}
            >
              {loading ? 'Saving...' : initialData ? 'Update Record' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
