/**
 * ContributionDistributionPanel - Distribution of contributions
 * Only displayed in understanding_contribution phase
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { Slider } from '@/src/shared/ui';

interface ContributionDistributionPanelProps {
  participants: UserResponseDto[];
  contributions: Record<string, number>;
  onContributionChange: (participantId: string, value: number) => void;
  onAutoSave?: () => void;
  totalContribution: number;
}

export const ContributionDistributionPanel: React.FC<ContributionDistributionPanelProps> = ({
  participants,
  contributions,
  onContributionChange,
  onAutoSave,
  totalContribution,
}) => {
  const isValidTotal = Math.abs(totalContribution - 100) < 0.1;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[20px] md:rounded-[32px] p-4 md:p-8 shadow-xl mb-8 md:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 pb-4 md:pb-6 mb-4 md:mb-6 border-b-2 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <label className="text-lg md:text-xl font-black text-purple-900">
            Вклад участников в ваше понимание вопроса
          </label>
          {/* {onAutoSave && (
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
              ✓ Автосохранение
            </span>
          )} */}
        </div>
        <span
          className={`text-2xl md:text-3xl font-black tabular-nums ${
            isValidTotal ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {totalContribution.toFixed(1)}%
        </span>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">


        <div className="space-y-3 md:space-y-4">
          {participants.map((participant) => {
            const contribution = Number(contributions[participant._id] || 0);

            const isLocked = totalContribution >= 100;

            return (
              <div key={participant._id}>
                <div className="flex justify-between items-center mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      {participant.fullName}
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      {participant.email}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-purple-600 tabular-nums">
                    {contribution}%
                  </span>
                </div>

                <Slider
                  value={contribution}
                  min={0}
                  max={100}
                  step={10}
                  variant="default"
                  onChange={(value) => {
                    if (isLocked && value > contribution) return;
                    onContributionChange(participant._id, value);
                  }}
                  onChangeEnd={onAutoSave}
                />
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
