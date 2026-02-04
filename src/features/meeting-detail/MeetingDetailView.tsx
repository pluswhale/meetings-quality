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
import { CreatorSubmissionsPanel } from './components/CreatorSubmissionsPanel';
import { PendingVotersPanel } from './components/PendingVotersPanel';

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
    return <div className="p-20 text-center text-slate-500 font-bold">Встреча не найдена</div>;
  }

  // Finished phase view (special layout)
  if (vm.meeting.currentPhase === MeetingResponseDtoCurrentPhase.finished) {
    return <FinishedPhaseView meeting={vm.meeting} onBack={vm.handleNavigateBack} />;
  }

  // Active meeting view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6 md:p-12 pb-40"
    >
      <MeetingHeader
        meetingId={id || ''}
        title={vm.meeting.title}
        createdAt={vm.meeting.createdAt}
        currentPhase={vm.activePhase}
        actualCurrentPhase={vm.meeting.currentPhase}
        onBack={vm.handleNavigateBack}
        isCreator={vm.isCreator}
        onPhaseClick={vm.handleChangeToPhase}
      />

      {/* Banner for participants viewing previous phase */}
      {!vm.isCreator && vm.viewedPhase && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[32px] p-6 shadow-lg mb-12"
        >
          <div className="flex items-center justify-between gap-4 ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-amber-900 text-lg">
                  Вы просматриваете предыдущий этап
                </h3>
                <p className="text-sm font-bold text-amber-700 mt-1">
                  Вы можете изменить свой ответ. Изменения сохранятся при отправке.
                </p>
              </div>
            </div>
            <button
              onClick={vm.handleReturnToCurrentPhase}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-2xl transition-all hover:scale-105 whitespace-nowrap shadow-lg"
            >
              Вернуться к текущему
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-12"
      >
        {/* Pending Voters Panel - Only visible for creators */}
        {vm.isCreator && vm.meeting.currentPhase !== MeetingResponseDtoCurrentPhase.finished && (
          <PendingVotersPanel
            pendingVoters={vm.pendingVoters || []}
            isLoading={!vm.pendingVoters}
            currentPhase={vm.meeting.currentPhase}
          />
        )}

        {/* Creator Submissions Panel - Only visible for creators */}
        {vm.isCreator && vm.meeting.currentPhase !== MeetingResponseDtoCurrentPhase.finished && (
          <CreatorSubmissionsPanel
            isApprovingTask={vm.isApprovingTask}
            onApproveTask={vm.handleApproveTask}
            submissions={vm.phaseSubmissions}
            participants={vm.meetingParticipants}
            isLoading={!vm.phaseSubmissions}
          />
        )}

        <PhaseContent vm={vm} />
      </motion.div>
    </motion.div>
  );
};
