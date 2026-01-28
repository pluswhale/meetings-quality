/**
 * UnderstandingScorePanel - Always visible panel for understanding score
 * Displayed on all phases (except finished) for participants
 */

import React from 'react';
import { Slider } from '@/src/shared/ui';

interface UnderstandingScorePanelProps {
  understandingScore: number;
  onUnderstandingScoreChange: (value: number) => void;
}

export const UnderstandingScorePanel: React.FC<UnderstandingScorePanelProps> = ({
  understandingScore,
  onUnderstandingScoreChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[20px] md:rounded-[32px] p-4 md:p-8 shadow-xl mb-8 md:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-black text-blue-900 flex-1">
          Ваше понимание вопроса
        </h3>
        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
          Доступно всегда
        </span>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <label className="text-xs md:text-sm font-black text-slate-600 uppercase tracking-wider">
            Уровень понимания
          </label>
          <span className="text-3xl md:text-4xl font-black text-green-600 tabular-nums">
            {understandingScore}%
          </span>
        </div>
        <Slider
          value={understandingScore}
          onChange={onUnderstandingScoreChange}
          variant="green"
        />
        <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-400 mt-2">
          <span className="text-red-500">0 - Не понимаю</span>
          <span className="text-orange-500">25</span>
          <span className="text-blue-500">50</span>
          <span className="text-green-500">100 - Полностью понимаю</span>
        </div>
      </div>
    </div>
  );
};
