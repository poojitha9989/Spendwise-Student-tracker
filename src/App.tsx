import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import {
  StudentProfile,
  Transaction,
  BudgetOverview,
  AnalyticsData,
  TransactionType
} from './types';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Core Data States
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Current selected month for budget view
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState<string>(defaultMonth);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalCategory, setBudgetModalCategory] = useState<string>('TOTAL');
  const [budgetModalInitialAmount, setBudgetModalInitialAmount] = useState<number>(22000);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all app data
  const loadAllData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);

      const [pData, txData, bData, aData] = await Promise.all([
        api.getProfile(),
        api.getTransactions(),
        api.getBudgets(selectedBudgetMonth),
        api.getAnalytics()
      ]);

      setProfile(pData);
      setTransactions(txData);
      setBudgets(bData);
      setAnalytics(aData);
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [selectedBudgetMonth]);

  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  // Handle open transaction modal
  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleOpenDeleteModal = (tx: Transaction) => {
    setDeletingTransaction(tx);
    setIsDeleteModalOpen(true);
  };

  const handleOpenBudgetModal = (category = 'TOTAL', initialAmount = 22000) => {
    setBudgetModalCategory(category);
    setBudgetModalInitialAmount(initialAmount);
    setIsBudgetModalOpen(true);
  };

  // Transaction submission (Create or Update)
  const handleTransactionSubmit = async (data: Omit<Transaction, 'id' | 'created_at'>) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, data);
    } else {
      await api.addTransaction(data);
    }
    await loadAllData(false);
  };

  // Transaction deletion
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    try {
      setDeleteLoading(true);
      await api.deleteTransaction(deletingTransaction.id);
      setIsDeleteModalOpen(false);
      setDeletingTransaction(null);
      await loadAllData(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Budget submission
  const handleBudgetSubmit = async (month: string, category: string, amount: number) => {
    await api.setBudget(month, category, amount);
    await loadAllData(false);
  };

  // Profile update
  const handleUpdateProfile = async (data: Partial<StudentProfile>) => {
    await api.updateProfile(data);
    await loadAllData(false);
  };

  // Reset demo data
  const handleResetDemoData = async () => {
    await api.resetDemoData();
    await loadAllData(false);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <h2 className="text-white text-base font-semibold mt-4">Student Expense Tracker</h2>
        <p className="text-slate-400 text-xs mt-1">Connecting to SQLite database...</p>
      </div>
    );
  }

  const currency = profile?.currency || '₹';
  const monthlySpent = analytics?.currentMonth.expense || 0;
  const monthlyBudget = analytics?.currentMonth.monthlyBudget || profile?.monthly_budget || 22000;
  const totalBalance = analytics?.totalBalance || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        monthlySpent={monthlySpent}
        monthlyBudget={monthlyBudget}
        currency={currency}
        warningThreshold={profile?.warning_threshold || 80}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          profile={profile}
          totalBalance={totalBalance}
          onOpenAddModal={handleOpenAddModal}
          onOpenSidebar={() => setSidebarOpen(true)}
          activeTab={activeTab}
          onNavigate={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-xs font-semibold">
              <span>{error}</span>
              <button
                onClick={() => loadAllData(true)}
                className="px-3 py-1 bg-white border border-rose-300 rounded-lg hover:bg-rose-50"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && analytics && (
            <DashboardView
              data={analytics}
              profile={profile}
              onOpenAddModal={handleOpenAddModal}
              onOpenBudgetModal={() => handleOpenBudgetModal('TOTAL', monthlyBudget)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              profile={profile}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenDeleteModal={handleOpenDeleteModal}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              profile={profile}
              currentMonth={selectedBudgetMonth}
              onMonthChange={(m) => {
                setSelectedBudgetMonth(m);
              }}
              onOpenBudgetModal={(cat, amt) => handleOpenBudgetModal(cat || 'TOTAL', amt || 5000)}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'reports' && analytics && (
            <ReportsView
              analytics={analytics}
              transactions={transactions}
              profile={profile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetDemoData={handleResetDemoData}
              onRefresh={() => loadAllData(false)}
            />
          )}
        </main>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        initialData={editingTransaction}
        currency={currency}
        defaultType={txModalType}
      />

      {/* Budget Modal (Overall Cap or Category Limit) */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleBudgetSubmit}
        currentMonth={selectedBudgetMonth}
        category={budgetModalCategory}
        initialAmount={budgetModalInitialAmount}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTransaction(null);
        }}
        onConfirm={handleConfirmDelete}
        transaction={deletingTransaction}
        currency={currency}
        loading={deleteLoading}
      />
    </div>
  );
}
