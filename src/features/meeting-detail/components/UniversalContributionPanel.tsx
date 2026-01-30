/**
 * UniversalContributionPanel - Always visible panel for understanding and contribution scoring
 * Available at all meeting phases
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ContributionsMap } from '../types';
import { Slider } from '@/src/shared/ui';

interface UniversalContributionPanelProps {
  participants: UserResponseDto[];
  understandingScore: number;
  onUnderstandingScoreChange: (score: number) => void;
  contributions: ContributionsMap;
  onContributionChange: (participantId: string, value: number) => void;
  totalContribution: number;
}

export const UniversalContributionPanel: React.FC<UniversalContributionPanelProps> = ({
  participants,
  understandingScore,
  onUnderstandingScoreChange,
  contributions,
  onContributionChange,
  totalContribution,
}) => {
  const isValidTotal = Math.abs(totalContribution - 100) < 0.1;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[32px] p-8 shadow-xl mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-blue-900">Оценка понимания и вклада</h3>
        <div className="flex-1" />
        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          Доступно всегда
        </span>
      </div>

      {/* Understanding Score */}
      <div className="bg-white rounded-2xl p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-black text-slate-600 uppercase tracking-wider">
            Ваше понимание вопроса kk
          </label>
          <span className="text-4xl font-black text-green-600 tabular-nums">
            {understandingScore}%
          </span>
        </div>
        <Slider
          value={understandingScore}
          onChange={onUnderstandingScoreChange}
          variant="green"
        />
      </div>

      {/* Contributions */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b-2 border-slate-100">

          <span
            className={`text-3xl font-black tabular-nums ${
              isValidTotal ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {totalContribution.toFixed(1)}%
          </span>
        </div>

        <div className="space-y-4">
          {participants.map((participant) => {
            const contribution = Number(contributions[participant._id] || 0);
            return (
              <div key={participant._id}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-bold text-slate-900">{participant.fullName}</span>
                    <span className="text-xs text-slate-400 ml-2">{participant.email}</span>
                  </div>
                  <span className="text-xl font-black text-blue-600 tabular-nums">
                    {contribution}%
                  </span>
                </div>
                <Slider
                  value={contribution}
                  onChange={(value) => onContributionChange(participant._id, value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {!isValidTotal && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-bold text-red-600 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Сумма вкладов должна равняться 100%. Текущая сумма: {totalContribution.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};
