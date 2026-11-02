import React from 'react';
import { Line } from 'react-chartjs-2';
import './ChartConfig';
import { SpendingTrendPoint } from '../../types';
import { TEAL_PRIMARY, SLATE_GRID } from './ChartConfig';

interface Props {
  points: SpendingTrendPoint[];
  monthlyBudget: number;
  currency?: string;
}

export const SpendingTrendLineChart: React.FC<Props> = ({ points, monthlyBudget, currency = '₹' }) => {
  if (!points || points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
        <p>No daily spending trends available for this month</p>
      </div>
    );
  }

  const labels = points.map(p => `Day ${p.day}`);
  const cumulativeData = points.map(p => p.cumulative);
  const budgetLine = points.map(() => monthlyBudget);

  const data = {
    labels,
    datasets: [
      {
        label: 'Cumulative Spending',
        data: cumulativeData,
        borderColor: TEAL_PRIMARY,
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: points.length > 20 ? 1.5 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: TEAL_PRIMARY,
      },
      {
        label: 'Monthly Budget Cap',
        data: budgetLine,
        borderColor: '#94A3B8',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
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
        grid: { display: false },
        ticks: {
          maxTicksLimit: 10,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          color: '#64748B',
        },
      },
      y: {
        grid: { color: SLATE_GRID },
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
      <Line data={data} options={options} />
    </div>
  );
};
