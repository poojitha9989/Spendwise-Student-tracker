import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './ChartConfig';
import { CategoryBreakdownItem, CATEGORY_COLORS } from '../../types';

interface Props {
  breakdown: CategoryBreakdownItem[];
  currency?: string;
  totalExpense: number;
}

export const CategoryDoughnutChart: React.FC<Props> = ({ breakdown, currency = '₹', totalExpense }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
        <p>No expense data recorded for this month</p>
      </div>
    );
  }

  const labels = breakdown.map(b => b.category);
  const dataValues = breakdown.map(b => b.amount);
  const backgroundColors = breakdown.map(b => CATEGORY_COLORS[b.category]?.hex || '#94A3B8');

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 600 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const percentage = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
            return ` ${currency}${val.toLocaleString('en-IN')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-56 h-56">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Spent</span>
          <span className="text-lg font-bold text-slate-900 font-tabular">
            {currency}{totalExpense.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500">{breakdown.length} Categories</span>
        </div>
      </div>

      {/* Category Legends list */}
      <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs">
        {breakdown.slice(0, 6).map((item) => {
          const color = CATEGORY_COLORS[item.category]?.hex || '#94A3B8';
          const pct = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="truncate text-slate-700 font-medium">{item.category}</span>
              </div>
              <span className="text-slate-500 font-tabular font-semibold shrink-0 ml-1">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
