/**
 * VotingProgressBar - Shows submission progress
 */

import React from 'react';

interface VotingProgressBarProps {
  submitted: number;
  total: number;
}

export const VotingProgressBar: React.FC<VotingProgressBarProps> = ({ submitted, total }) => {
  const percentage = total > 0 ? (submitted / total) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-black text-slate-600 uppercase tracking-wider">Прогресс</span>
        <span className="text-2xl font-black text-blue-600">
          {submitted} / {total}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
