/**
 * AllSubmittedBanner - Success message when all participants have submitted
 */

import React from 'react';

export const AllSubmittedBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <h4 className="font-black text-lg">Все участники отправили данные!</h4>
        <p className="text-green-100 text-sm font-bold">
          Вы можете переключить на следующую фазу
        </p>
      </div>
    </div>
  );
};
