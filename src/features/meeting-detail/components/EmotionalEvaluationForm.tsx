/**
 * EmotionalEvaluationForm - Form for participants to submit emotional evaluations
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { EmotionalEvaluationsMap } from '../types';
import { Slider } from '@/src/shared/ui';

interface EmotionalEvaluationFormProps {
  participants: UserResponseDto[];
  evaluations: EmotionalEvaluationsMap;
  onUpdateEvaluation: (
    participantId: string,
    update: Partial<{ emotionalScale: number; isToxic: boolean }>
  ) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const EmotionalEvaluationForm: React.FC<EmotionalEvaluationFormProps> = ({
  participants,
  evaluations,
  onUpdateEvaluation,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <>
      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          Оцените эмоциональный фон участников
          <div className="flex-1 h-px bg-slate-200" />
        </h2>
        <div className="space-y-6">
          {participants.map((participant) => {
            const evaluation = evaluations[participant._id] || {
              emotionalScale: 0,
              isToxic: false,
            };
            return (
              <div
                key={participant._id}
                className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{participant.fullName}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {participant.email}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluation.isToxic}
                      onChange={(e) =>
                        onUpdateEvaluation(participant._id, { isToxic: e.target.checked })
                      }
                      className="w-5 h-5 rounded accent-red-600"
                    />
                    <span className="text-sm font-black text-red-600 uppercase tracking-wider">
                      Токсичен
                    </span>
                  </label>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Эмоциональная оценка
                  </span>
                  <span
                    className={`text-3xl font-black tabular-nums ${
                      evaluation.emotionalScale > 0
                        ? 'text-green-600'
                        : evaluation.emotionalScale < 0
                        ? 'text-red-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {evaluation.emotionalScale > 0 ? '+' : ''}
                    {evaluation.emotionalScale}
                  </span>
                </div>
                <div className="my-4">
                  <Slider
                    value={evaluation.emotionalScale}
                    min={-100}
                    max={100}
                    onChange={(value) =>
                      onUpdateEvaluation(participant._id, {
                        emotionalScale: value,
                      })
                    }
                    variant="emotional"
                    showProgress={false}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                  <span className="text-red-500">-100 (негативная)</span>
                  <span className="text-green-500">+100 (позитивная)</span>
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
        {isSubmitting ? 'Сохранение...' : 'Сохранить оценку'}
      </button>
    </>
  );
};
