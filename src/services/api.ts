import {
  Transaction,
  StudentProfile,
  BudgetOverview,
  AnalyticsData
} from '../types';

export const formatCurrency = (amount: number, currency = '₹'): string => {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
};

export const api = {
  async getProfile(): Promise<StudentProfile> {
    const res = await fetch('/api/profile');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch profile');
    return json.data;
  },

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update profile');
    return json.data;
  },

  async getTransactions(params?: {
    type?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
    }
    const res = await fetch(`/api/transactions?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch transactions');
    return json.data;
  },

  async addTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to add transaction');
    return json.data;
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update transaction');
    return json.data;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete transaction');
    return true;
  },

  async getBudgets(month?: string): Promise<BudgetOverview> {
    const url = month ? `/api/budgets?month=${month}` : '/api/budgets';
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch budgets');
    return json.data;
  },

  async setBudget(month: string, category: string, amount: number): Promise<boolean> {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, category, amount })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to set budget');
    return true;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch analytics');
    return json.data;
  },

  async resetDemoData(): Promise<boolean> {
    const res = await fetch('/api/demo-data', {
      method: 'POST'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reload demo data');
    return true;
  },

  exportCSVUrl(): string {
    return '/api/export';
  }
};
