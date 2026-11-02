import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_COLORS,
  StudentProfile
} from '../types';
import { formatCurrency, api } from '../services/api';

interface Props {
  transactions: Transaction[];
  profile: StudentProfile | null;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  onOpenEditModal: (tx: Transaction) => void;
  onOpenDeleteModal: (tx: Transaction) => void;
  onRefresh: () => void;
}

export const TransactionsView: React.FC<Props> = ({
  transactions,
  profile,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onRefresh,
}) => {
  const currency = profile?.currency || '₹';

  // Filters & State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.payment_method.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      if (dateRangeFilter === 'month') {
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        result = result.filter((t) => t.date.startsWith(currentMonthStr));
      } else if (dateRangeFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((t) => new Date(t.date) >= oneWeekAgo);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else {
        // Date sorting
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, dateRangeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    window.location.href = api.exportCSVUrl();
  };

  const allCategories = [
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-500">
            View, search, edit, and record all student income and daily expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs whitespace-nowrap"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => onOpenAddModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-xs whitespace-nowrap"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Record Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description, payment method, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Type Segmented Buttons (3 cols) */}
          <div className="md:col-span-3 flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                typeFilter === 'expense' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                typeFilter === 'income' ? 'bg-white text-teal-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">Past 7 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 font-tabular">{filteredTransactions.length}</strong> transactions
            </span>
            {(search || typeFilter !== 'all' || categoryFilter !== 'all' || dateRangeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setDateRangeFilter('all');
                  setCurrentPage(1);
                }}
                className="text-teal-600 hover:underline font-medium text-xs ml-2"
              >
                Clear all filters
              </button>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            title="Refresh transactions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Tag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No transactions match your search</p>
            <p className="mt-1 text-slate-400">Try adjusting your filters or record a new transaction.</p>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
            >
              Log New Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      {sortBy === 'date' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortBy === 'amount' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedTransactions.map((tx) => {
                  const isExp = tx.type === 'expense';
                  const catStyle = CATEGORY_COLORS[tx.category];

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-tabular text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description / Notes */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isExp ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                            {isExp ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-semibold block">{tx.title}</span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 block line-clamp-1">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catStyle?.hex || '#94A3B8' }}
                          />
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.payment_method}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-tabular font-bold whitespace-nowrap">
                        <span className={isExp ? 'text-slate-900' : 'text-teal-600'}>
                          {isExp ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredTransactions.length > itemsPerPage && (
          <div className="px-4 py-3 bg-slate-50/75 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
