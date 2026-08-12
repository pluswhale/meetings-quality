/**
 * PhaseIndicator - Visual stepper showing meeting phases
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
import { getPhaseIndex } from '@/src/shared/lib';

interface PhaseIndicatorProps {
  currentPhase: MeetingResponseDtoCurrentPhase;
  viewedPhase?: MeetingResponseDtoCurrentPhase; // The phase being viewed (if different from current)
  isCreator?: boolean;
  onPhaseClick?: (phase: MeetingResponseDtoCurrentPhase) => void;
  onPrevPhase?: () => void; // Step view mode one phase back
  onNextPhase?: () => void; // Step view mode one phase forward (exits view mode at the live phase)
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  viewedPhase,
  isCreator = false,
  onPhaseClick,
  onPrevPhase,
  onNextPhase,
}) => {
  const currentIndex = getPhaseIndex(currentPhase);
  const viewedIndex = viewedPhase ? getPhaseIndex(viewedPhase) : currentIndex;
  const displayPhases = PHASE_ORDER.slice(0, -1); // Exclude 'finished' from visual display

  const canGoBack = !!onPrevPhase && viewedIndex > 0;
  const canGoForward = !!onNextPhase && !!viewedPhase && viewedIndex < currentIndex;

  const navButtonClass = (enabled: boolean) =>
    `w-8 h-8 rounded-full flex items-center justify-center transition-all mb-6 ${
      enabled
        ? 'bg-white text-slate-700 shadow-md hover:bg-slate-900 hover:text-white cursor-pointer'
        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
    }`;

  return (
    <div className="flex flex-col gap-4">
      {!isCreator && onPhaseClick && (
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500">
            💡 Нажмите на завершенный этап, чтобы изменить свой ответ
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={canGoBack ? { scale: 1.1 } : {}}
          whileTap={canGoBack ? { scale: 0.9 } : {}}
          onClick={canGoBack ? onPrevPhase : undefined}
          disabled={!canGoBack}
          className={navButtonClass(canGoBack)}
          title="Предыдущий этап"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        {displayPhases.map((phase, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isViewing = index === viewedIndex;
          // Creators can click any phase, participants can only click completed phases
          const isClickable = onPhaseClick && (isCreator || isCompleted);

          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center gap-2 relative group">
                <motion.div
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={isClickable ? () => onPhaseClick(phase) : undefined}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 ${
                    isViewing && viewedPhase
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110 ring-4 ring-blue-200'
                      : isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110'
                          : 'bg-slate-200 text-slate-400'
                  } ${isClickable ? 'cursor-pointer hover:ring-4 hover:ring-green-100' : ''}`}
                  title={
                    isClickable && isCompleted
                      ? 'Нажмите, чтобы вернуться к этому этапу'
                      : undefined
                  }
                >
                  {isCompleted ? '✓' : index + 1}
                </motion.div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${
                    isViewing && viewedPhase
                      ? 'text-blue-600'
                      : isCurrent
                        ? 'text-blue-600'
                        : isCompleted && isClickable
                          ? 'text-green-600'
                          : 'text-slate-400'
                  }`}
                >
                  {PHASE_LABELS[phase]}
                </span>
                {isClickable && isCompleted && !isViewing && (
                  <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[8px] font-black text-green-600 whitespace-nowrap bg-green-50 px-2 py-1 rounded-full">
                      Вернуться
                    </div>
                  </div>
                )}
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
        <motion.button
          type="button"
          whileHover={canGoForward ? { scale: 1.1 } : {}}
          whileTap={canGoForward ? { scale: 0.9 } : {}}
          onClick={canGoForward ? onNextPhase : undefined}
          disabled={!canGoForward}
          className={navButtonClass(canGoForward)}
          title="Следующий этап"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};
