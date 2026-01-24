/**
 * MeetingDetailView - Main view component for meeting details
 * Pure presentation layer - receives all data and handlers from ViewModel
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { useMeetingDetailViewModel } from './useMeetingDetailViewModel';
import { MeetingHeader } from './components/MeetingHeader';
import { FinishedPhaseView } from './components/FinishedPhaseView';
import { PhaseContent } from './components/PhaseContent';

export const MeetingDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vm = useMeetingDetailViewModel(id || '');

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold">Загрузка встречи...</p>
      </div>
    );
  }

  // Meeting not found
  if (!vm.meeting) {
    return (
      <div className="p-20 text-center text-slate-500 font-bold">Встреча не найдена</div>
    );
  }

  // Finished phase view (special layout)
  if (
    vm.meeting.currentPhase === MeetingResponseDtoCurrentPhase.finished &&
    vm.statistics
  ) {
    return (
      <FinishedPhaseView
        meeting={vm.meeting}
        statistics={vm.statistics}
        onBack={vm.handleNavigateBack}
      />
    );
  }

  // Active meeting view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-6 md:p-12 pb-40"
    >
      <MeetingHeader
        meetingId={id || ''}
        title={vm.meeting.title}
        createdAt={vm.meeting.createdAt}
        currentPhase={vm.meeting.currentPhase}
        onBack={vm.handleNavigateBack}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-12"
      >
        <PhaseContent vm={vm} />
      </motion.div>
    </motion.div>
  );
};
