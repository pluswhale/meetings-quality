/**
 * ParticipantStatusCard - Shows individual participant submission status
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface ParticipantStatusCardProps {
  participant: UserResponseDto;
  hasSubmitted: boolean;
}

export const ParticipantStatusCard: React.FC<ParticipantStatusCardProps> = ({
  participant,
  hasSubmitted,
}) => {
  return (
    <div
      className={`bg-white p-5 rounded-2xl border-2 transition-all ${
        hasSubmitted ? 'border-green-200 bg-green-50/50' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
              hasSubmitted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {hasSubmitted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-black text-slate-900">{participant.fullName}</h4>
            <p className="text-xs text-slate-500 font-bold">{participant.email}</p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
            hasSubmitted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {hasSubmitted ? 'Отправлено' : 'Ожидание'}
        </div>
      </div>
    </div>
  );
};
