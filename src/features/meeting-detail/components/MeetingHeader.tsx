/**
 * MeetingHeader - Displays meeting title, back button, and phase indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PhaseIndicator } from '@/src/shared/components';

interface MeetingHeaderProps {
  meetingId: string;
  title: string;
  createdAt: string;
  currentPhase: MeetingResponseDtoCurrentPhase;
  actualCurrentPhase?: MeetingResponseDtoCurrentPhase; // For showing actual phase when participant views previous
  onBack: () => void;
  isCreator?: boolean;
  onPhaseClick: (phase: MeetingResponseDtoCurrentPhase) => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingId,
  title,
  createdAt,
  currentPhase,
  actualCurrentPhase,
  onBack,
  isCreator = false,
  onPhaseClick,
}) => {
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

      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PhaseIndicator 
          currentPhase={actualCurrentPhase || currentPhase}
          viewedPhase={actualCurrentPhase ? currentPhase : undefined}
          isCreator={isCreator}
          onPhaseClick={onPhaseClick}
        />
      </motion.div>
    </motion.div>
  );
};
