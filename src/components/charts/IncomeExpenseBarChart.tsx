import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ChartConfig';
import { MonthlyTrend } from '../../types';
import { TEAL_PRIMARY, ROSE_ACCENT, SLATE_GRID } from './ChartConfig';

interface Props {
  trends: MonthlyTrend[];
  currency?: string;
}

export const IncomeExpenseBarChart: React.FC<Props> = ({ trends, currency = '₹' }) => {
  const labels = trends.map(t => t.monthLabel);
  const incomeData = trends.map(t => t.income);
  const expenseData = trends.map(t => t.expense);

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: '#0D9488',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: '#F43F5E',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle' as const,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
            weight: 500,
          },
          color: '#475569',
        },
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
            return ` ${context.dataset.label}: ${currency}${val.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          color: '#64748B',
        },
      },
      y: {
        grid: {
          color: SLATE_GRID,
        },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          color: '#64748B',
          callback: (value: any) => `${currency}${Number(value).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-72">
      <Bar data={data} options={options} />
    </div>
  );
};
