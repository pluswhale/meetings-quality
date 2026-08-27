/**
 * MeetingHeader - Displays meeting title, back button, and phase indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { PhaseIndicator } from '@/src/shared/components';
import { formatDate, formatTime } from '@/src/shared/lib';

interface MeetingHeaderProps {
  meetingId: string;
  title: string;
  createdAt: string;
  /** Scheduled start of the meeting. Visible to every participant. */
  upcomingDate?: string;
  /** Live phase (Zustand), with REST phase as fallback. */
  currentPhase: MeetingResponseDtoCurrentPhase;
  /** Phase being viewed, when the user stepped back into a past phase. */
  viewedPhase?: MeetingResponseDtoCurrentPhase;
  onBack: () => void;
  isCreator?: boolean;
  onPhaseClick: (phase: MeetingResponseDtoCurrentPhase) => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingId,
  title,
  createdAt,
  upcomingDate,
  currentPhase,
  viewedPhase,
  onBack,
  isCreator = false,
  onPhaseClick,
  onPrevPhase,
  onNextPhase,
}) => {
  const scheduled = upcomingDate ? new Date(upcomingDate) : null;
  const hasSchedule = scheduled !== null && !isNaN(scheduled.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8"
    >
      <div className="flex-1">
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="text-slate-500 mb-6 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Вернуться
        </motion.button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          {title}
        </h1>

        {hasSchedule && (
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDate(scheduled)}, {formatTime(scheduled)}
            </span>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PhaseIndicator
          currentPhase={currentPhase}
          viewedPhase={viewedPhase}
          isCreator={isCreator}
          onPhaseClick={onPhaseClick}
          onPrevPhase={onPrevPhase}
          onNextPhase={onNextPhase}
        />
      </motion.div>
    </motion.div>
  );
};
