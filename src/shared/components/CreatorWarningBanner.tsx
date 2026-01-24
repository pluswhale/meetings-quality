/**
 * CreatorWarningBanner - Informs creator they cannot submit evaluations
 */

import React from 'react';

export const CreatorWarningBanner: React.FC = () => {
  return (
    <div className="p-10 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-[40px] mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-black text-amber-900">Вы — организатор встречи</h4>
          <p className="text-amber-700 text-sm font-bold">
            Только участники могут отправлять оценки. Вы можете просматривать статус их ответов ниже.
          </p>
        </div>
      </div>
    </div>
  );
};
