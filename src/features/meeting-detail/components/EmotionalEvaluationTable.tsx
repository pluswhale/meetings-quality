/**
 * EmotionalEvaluationTable - Table format for evaluating all participants' emotional state
 */

import React from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { EmotionalEvaluationsMap } from '../types';
import { Slider } from '@/src/shared/ui';

interface EmotionalEvaluationTableProps {
  participants: UserResponseDto[];
  evaluations: EmotionalEvaluationsMap;
  onUpdateEvaluation: (
    participantId: string,
    update: Partial<{ emotionalScale: number; isToxic: boolean }>
  ) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const EmotionalEvaluationTable: React.FC<EmotionalEvaluationTableProps> = ({
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

        <div className="bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 border-b-2 border-slate-200">
            <div className="grid grid-cols-12 gap-4 p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
              <div className="col-span-3">Участник</div>
              <div className="col-span-6 text-center">Эмоциональная оценка</div>
              <div className="col-span-2 text-center">Оценка</div>
              <div className="col-span-1 text-center">Токсичен</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {participants.map((participant) => {
              const evaluation = evaluations[participant._id] || {
                emotionalScale: 0,
                isToxic: false,
              };

              return (
                <div
                  key={participant._id}
                  className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-slate-50 transition-colors"
                >
                  {/* Participant Info */}
                  <div className="col-span-3">
                    <h4 className="font-black text-slate-900">{participant.fullName}</h4>
                    <p className="text-xs text-slate-400 font-bold truncate">
                      {participant.email}
                    </p>
                  </div>

                  {/* Slider */}
                  <div className="col-span-6">
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
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                      <span className="text-red-500">-100</span>
                      <span className="text-slate-400">0</span>
                      <span className="text-green-500">+100</span>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="col-span-2 text-center">
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

                  {/* Toxic Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={evaluation.isToxic}
                        onChange={(e) =>
                          onUpdateEvaluation(participant._id, { isToxic: e.target.checked })
                        }
                        className="w-6 h-6 rounded accent-red-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
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
