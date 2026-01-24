/**
 * PhaseIndicator - Visual stepper showing meeting phases
 */

import React from 'react';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
import { getPhaseIndex } from '@/src/shared/lib';

interface PhaseIndicatorProps {
  currentPhase: MeetingResponseDtoCurrentPhase;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase }) => {
  const currentIndex = getPhaseIndex(currentPhase);
  const displayPhases = PHASE_ORDER.slice(0, -1); // Exclude 'finished' from visual display

  return (
    <div className="flex items-center gap-3">
      {displayPhases.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <React.Fragment key={phase}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
                  isCompleted
                    ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${
                  isCurrent ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            </div>
            {index < displayPhases.length - 1 && (
              <div
                className={`w-8 h-1 rounded-full mb-6 ${
                  isCompleted ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
