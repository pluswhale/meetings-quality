/**
 * UnderstandingContributionForm - Form for understanding score and contribution distribution
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ContributionsMap } from '../types';
import { VALIDATION } from '@/src/shared/constants';
import { Slider } from '@/src/shared/ui';

interface UnderstandingContributionFormProps {
  participants: UserResponseDto[];
  understandingScore: number;
  onUnderstandingScoreChange: (score: number) => void;
  contributions: ContributionsMap;
  onContributionChange: (participantId: string, value: number) => void;
  totalContribution: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const UnderstandingContributionForm: React.FC<UnderstandingContributionFormProps> = ({
  participants,
  understandingScore,
  onUnderstandingScoreChange,
  contributions,
  onContributionChange,
  totalContribution,
  onSubmit,
  isSubmitting,
}) => {
  const isValidTotal =
    Math.abs(totalContribution - VALIDATION.REQUIRED_CONTRIBUTION_TOTAL) <
    VALIDATION.CONTRIBUTION_TOLERANCE;

  return (
    <>
      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          Ваше понимание вопроса
          <div className="flex-1 h-px bg-slate-200" />
        </h2>
        <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100">
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Уровень понимания задачи
            </p>
            <span className="text-5xl font-black text-green-600 tabular-nums">
              {understandingScore}%
            </span>
          </div>
          <div className="mt-4">
            <Slider
              value={understandingScore}
              onChange={onUnderstandingScoreChange}
              variant="green"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          Распределите вклад участников
          <div className="flex-1 h-px bg-slate-200" />
        </h2>
        <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100 space-y-8">
          <div className="flex justify-between items-center pb-6 border-b-2 border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Общий вклад
            </span>
            <span
              className={`text-4xl font-black tabular-nums ${
                isValidTotal ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalContribution.toFixed(1)}%
            </span>
          </div>
          {participants.map((participant) => {
            const contribution = Number(contributions[participant._id] || 0);
            return (
              <div key={participant._id}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-black text-slate-900">{participant.fullName}</h4>
                    <p className="text-xs text-slate-400 font-bold">{participant.email}</p>
                  </div>
                  <span className="text-2xl font-black text-blue-600 tabular-nums">
                    {contribution}%
                  </span>
                </div>
                <div className="mt-2">
                  <Slider
                    value={contribution}
                    onChange={(value) => onContributionChange(participant._id, value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Сохранение...' : 'Сохранить данные'}
      </button>
    </>
  );
};
