/**
 * EmotionalEvaluationTable — Phase 1 live form.
 *
 * Only shows the "Токсичен" (Toxic) flag per participant.
 * Fires onLiveUpdate on every checkbox change → user:update_live_vote.
 */

import React from 'react';
import type { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { EmotionalEvaluationsMap } from '../types';

interface EmotionalEvaluationTableProps {
  currentUser: UserResponseDto;
  participants: UserResponseDto[];
  evaluations: EmotionalEvaluationsMap;
  onUpdateEvaluation: (
    participantId: string,
    update: Partial<{ emotionalScale: number; isToxic: boolean }>,
  ) => void;
  /** Called on every checkbox change. Fires user:update_live_vote. */
  onLiveUpdate: () => void;
}

export const EmotionalEvaluationTable: React.FC<EmotionalEvaluationTableProps> = ({
  currentUser,
  participants,
  evaluations,
  onUpdateEvaluation,
  onLiveUpdate,
}) => {
  const others = participants.filter((p) => p._id !== currentUser?._id);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">Оцените участников встречи</h2>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
          ● Автосохранение
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b-2 border-slate-200">
          <div className="grid grid-cols-[1fr_120px] p-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            <div>Участник</div>
            <div className="text-center">Токсичен</div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {others.length === 0 && (
            <p className="p-8 text-center text-slate-400 font-medium">
              Нет других участников для оценки
            </p>
          )}
          {others.map((participant) => {
            const ev = evaluations[participant._id] ?? { emotionalScale: 0, isToxic: false };

            return (
              <div
                key={participant._id}
                className="grid grid-cols-[1fr_120px] items-center p-6 hover:bg-slate-50 transition-colors"
              >
                {/* Name */}
                <div>
                  <h4 className="font-black text-slate-900">{participant.fullName}</h4>
                  {participant.email && (
                    <p className="text-xs text-slate-400 mt-0.5">{participant.email}</p>
                  )}
                </div>

                {/* Toxic toggle */}
                <div className="flex justify-center">
                  <label className="cursor-pointer flex flex-col items-center gap-1.5">
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        ev.isToxic ? 'bg-red-500' : 'bg-slate-200'
                      }`}
                      onClick={() => {
                        onUpdateEvaluation(participant._id, { isToxic: !ev.isToxic });
                        setTimeout(onLiveUpdate, 0);
                      }}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          ev.isToxic ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        ev.isToxic ? 'text-red-500' : 'text-slate-400'
                      }`}
                    >
                      {ev.isToxic ? 'Да' : 'Нет'}
                    </span>
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
