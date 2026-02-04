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
  onAutoSave: () => void;
}

export const EmotionalEvaluationTable: React.FC<EmotionalEvaluationTableProps> = ({
  participants,
  evaluations,
  onUpdateEvaluation,
  onAutoSave,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        Оцените эмоциональный фон участников
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
          ✓ Автосохранение
        </span>
      </h2>

      <div className="bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b-2 border-slate-200">
          <div className="grid grid-cols-[1fr_120px] p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            <div>Участник</div>
            <div className="text-center">Токсичен</div>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-slate-100">
          {participants.map((participant) => {
            const evaluation = evaluations[participant._id] || {
              emotionalScale: 0,
              isToxic: false,
            };

            return (
              <div
                key={participant._id}
                className="grid grid-cols-[1fr_120px] items-center p-6 hover:bg-slate-50 transition-colors"
              >
                {/* Participant */}
                <div>
                  <h4 className="font-black text-slate-900">
                    {participant.fullName}
                  </h4>
                </div>

                {/* Toxic */}
                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluation.isToxic}
                      onChange={(e) => {
                        onUpdateEvaluation(participant._id, {
                          isToxic: e.target.checked,
                        });
                        setTimeout(onAutoSave, 100);
                      }}
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
  );
};

