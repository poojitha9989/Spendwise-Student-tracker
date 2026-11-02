import React from 'react';
import { Menu, Plus, Wallet, Calendar, Bell, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { StudentProfile } from '../types';
import { formatCurrency } from '../services/api';

interface Props {
  profile: StudentProfile | null;
  totalBalance: number;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  onOpenSidebar: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({
  profile,
  totalBalance,
  onOpenAddModal,
  onOpenSidebar,
  activeTab,
  onNavigate,
}) => {
  // Current date formatted nicely
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currency = profile?.currency || '₹';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span>Campus Finance Suite</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions, Balance Pill & Student Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Transaction Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onOpenAddModal('expense')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => onOpenAddModal('income')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
          </div>

          {/* Quick Balance Preview */}
          <div className="hidden md:flex flex-col text-right pr-2 border-r border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider">Balance</span>
            <span className={`text-sm font-bold font-tabular ${totalBalance >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              {formatCurrency(totalBalance, currency)}
            </span>
          </div>

          {/* Student Profile Clickable Card */}
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-left ${
              activeTab === 'settings'
                ? 'bg-slate-100 border-teal-500/50 shadow-xs'
                : 'hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="relative">
              <img
                src={profile?.avatar_url || '/src/assets/images/student_avatar_1793194127558.jpg'}
                alt={profile?.name || 'Student'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-teal-600 border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {profile?.name || 'Aryan Sharma'}
              </p>
              <p className="text-[11px] text-slate-500 leading-none truncate max-w-[120px]">
                {profile?.college ? profile.college.split(' ')[0] : 'NIT'} Student
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
