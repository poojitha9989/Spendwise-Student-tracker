import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Mail,
  Hash,
  Wallet,
  Coins,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { StudentProfile } from '../types';
import { formatCurrency } from '../services/api';

interface Props {
  profile: StudentProfile | null;
  onUpdateProfile: (data: Partial<StudentProfile>) => Promise<void>;
  onResetDemoData: () => Promise<void>;
  onRefresh: () => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' }
];

export const SettingsView: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onResetDemoData,
  onRefresh,
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [studentId, setStudentId] = useState(profile?.student_id || '');
  const [course, setCourse] = useState(profile?.course || 'B.Tech Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState(profile?.year_of_study || '3rd Year');
  const [currency, setCurrency] = useState(profile?.currency || '₹');
  const [monthlyBudget, setMonthlyBudget] = useState(profile?.monthly_budget?.toString() || '22000');
  const [warningThreshold, setWarningThreshold] = useState(profile?.warning_threshold?.toString() || '80');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setCollege(profile.college);
      setStudentId(profile.student_id);
      setCourse(profile.course || 'B.Tech Computer Science');
      setYearOfStudy(profile.year_of_study || '3rd Year');
      setCurrency(profile.currency);
      setMonthlyBudget(profile.monthly_budget.toString());
      setWarningThreshold(profile.warning_threshold.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const parsedBudget = parseFloat(monthlyBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setErrorMessage('Please enter a valid monthly budget limit.');
      return;
    }

    const parsedThreshold = parseFloat(warningThreshold);
    if (isNaN(parsedThreshold) || parsedThreshold < 10 || parsedThreshold > 100) {
      setErrorMessage('Warning threshold must be between 10% and 100%.');
      return;
    }

    try {
      setSaving(true);
      await onUpdateProfile({
        name: name.trim(),
        email: email.trim(),
        college: college.trim(),
        student_id: studentId.trim(),
        course: course.trim(),
        year_of_study: yearOfStudy.trim(),
        currency,
        monthly_budget: parsedBudget,
        warning_threshold: parsedThreshold
      });
      setSuccessMessage('Student profile and budget preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reload sample college demo data? This will refresh transactions and category allocations.')) {
      try {
        setResetting(true);
        await onResetDemoData();
        setSuccessMessage('Realistic student demo transactions and budgets loaded successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to reset demo data');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Profile & Settings</h2>
        <p className="text-xs text-slate-500">
          Personalize your collegiate identity, currency standards, and smart budget limits
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card Header with Avatar */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative">
            <img
              src={profile?.avatar_url || '/src/assets/images/student_avatar_1793194127558.jpg'}
              alt={profile?.name || 'Student Profile'}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-teal-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{profile?.name || 'Aryan Sharma'}</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-teal-50 rounded-md border border-teal-200">
                Active Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.college || 'National Institute of Technology'} · {profile?.course || 'B.Tech CSE'}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-tabular">
              Roll / ID: {profile?.student_id || 'NIT-2024-CS089'}
            </p>
          </div>
        </div>

        {/* Section 1: Academic & Personal Identity */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">Academic & Personal Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campus Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                College / University Name *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Student ID / Roll Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Degree / Course
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science, B.Com, MBA"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="1st Year / Fresher">1st Year / Fresher</option>
                <option value="2nd Year / Sophomore">2nd Year / Sophomore</option>
                <option value="3rd Year / Junior">3rd Year / Junior</option>
                <option value="4th Year / Senior">4th Year / Senior</option>
                <option value="Postgraduate / Master's">Postgraduate / Master's</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Budget Settings */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Coins className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">Currency & Budget Preferences</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preferred Currency *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.symbol}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Overall Monthly Budget Cap ({currency}) *
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="500"
                  required
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-tabular font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Warning Threshold (%)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="50"
                  max="95"
                  required
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-tabular text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Alert triggers when spending reaches this %</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile & Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Section 3: Data Management & Realistic Demo Data */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <RotateCcw className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">Database & Demo Management</h4>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <div>
            <h5 className="text-xs font-bold text-slate-900">Reload College Demo Data</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Seeds realistic student expenses (hostel mess, engineering books, transit passes, scholarship stipends, snacks) and predefined category budgets stored in persistent SQLite.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Load Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
