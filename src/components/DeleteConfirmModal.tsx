import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: Transaction | null;
  currency?: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  currency = '₹',
  loading = false,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">Delete Transaction</h3>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to delete this transaction? This action will immediately recalculate your balance and category budgets.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Description:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{transaction.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Amount:</span>
                <span className="font-bold text-slate-900 font-tabular">
                  {formatCurrency(transaction.amount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Date:</span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Category:</span>
                <span>{transaction.category}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {loading ? 'Deleting...' : 'Delete Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
