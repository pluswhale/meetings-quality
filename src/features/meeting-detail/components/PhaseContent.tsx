/**
 * PhaseContent - Routes to appropriate phase content based on current phase
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { CreatorWarningBanner } from '@/src/shared/components';
import { EmotionalEvaluationForm } from './EmotionalEvaluationForm';
import { UnderstandingContributionForm } from './UnderstandingContributionForm';
import { TaskPlanningForm } from './TaskPlanningForm';
import { CreatorStatsPanels } from './CreatorStatsPanels';
import { MeetingDetailViewModel } from '../types';

interface PhaseContentProps {
  vm: MeetingDetailViewModel;
}

export const PhaseContent: React.FC<PhaseContentProps> = ({ vm }) => {
  const { meeting, isCreator, activePhase } = vm;

  const renderDiscussionPhase = () => (
    <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center gap-4 text-slate-500 font-bold text-sm">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      </div>
      {isCreator
        ? 'Идет фаза активного обсуждения. Когда вопрос будет разобран, переключите на следующую фазу.'
        : 'Идет фаза активного обсуждения. Организатор переключит фазу, когда вопрос будет разобран.'}
    </div>
  );

  const renderEmotionalEvaluationPhase = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!isCreator ? (
        <EmotionalEvaluationForm
          participants={vm.meetingParticipants}
          evaluations={vm.emotionalEvaluations}
          onUpdateEvaluation={(id, update) =>
            vm.setEmotionalEvaluations((prev) => ({
              ...prev,
              [id]: { ...prev[id], ...update },
            }))
          }
          onSubmit={vm.handleSubmitEmotionalEvaluation}
          isSubmitting={vm.isSubmittingEmotional}
        />
      ) : (
        <CreatorWarningBanner />
      )}

      {isCreator && (
        <CreatorStatsPanels
          votingInfo={vm.votingInfo}
          phaseSubmissions={vm.phaseSubmissions}
          currentPhase={meeting.currentPhase}
          participants={vm.meetingParticipants}
        />
      )}
    </div>
  );

  const renderUnderstandingContributionPhase = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!isCreator ? (
        <UnderstandingContributionForm
          participants={vm.meetingParticipants}
          understandingScore={vm.understandingScore}
          onUnderstandingScoreChange={vm.setUnderstandingScore}
          contributions={vm.contributions}
          onContributionChange={(id, value) =>
            vm.setContributions((prev) => ({ ...prev, [id]: value }))
          }
          totalContribution={vm.totalContribution}
          onSubmit={vm.handleSubmitUnderstandingContribution}
          isSubmitting={vm.isSubmittingUnderstanding}
        />
      ) : (
        <CreatorWarningBanner />
      )}

      {isCreator && (
        <CreatorStatsPanels
          votingInfo={vm.votingInfo}
          phaseSubmissions={vm.phaseSubmissions}
          currentPhase={meeting.currentPhase}
          participants={vm.meetingParticipants}
        />
      )}
    </div>
  );

  const renderTaskPlanningPhase = () => (
    <div className="space-y-12">
      <TaskPlanningForm
        taskDescription={vm.taskDescription}
        onTaskDescriptionChange={vm.setTaskDescription}
        deadline={vm.deadline}
        onDeadlineChange={vm.setDeadline}
        expectedContribution={vm.expectedContribution}
        onExpectedContributionChange={vm.setExpectedContribution}
        onSubmit={vm.handleSubmitTaskPlanning}
        isSubmitting={vm.isSubmittingTask || vm.isCreatingTask}
      />

      {isCreator && (
        <CreatorStatsPanels
          votingInfo={vm.votingInfo}
          phaseSubmissions={vm.phaseSubmissions}
          currentPhase={meeting.currentPhase}
          participants={vm.meetingParticipants}
        />
      )}
    </div>
  );

  return (
    <>
      {/* Meeting Question Card */}
      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
        <div className="p-10 md:p-14">
          <h3 className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.3em]">
            Центральный вопрос
          </h3>
          <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {meeting.question}
          </p>
        </div>
        {activePhase === MeetingResponseDtoCurrentPhase.discussion &&
          renderDiscussionPhase()}
      </div>

      {/* Phase-specific content */}
      {activePhase === MeetingResponseDtoCurrentPhase.emotional_evaluation &&
        renderEmotionalEvaluationPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.understanding_contribution &&
        renderUnderstandingContributionPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.task_planning &&
        renderTaskPlanningPhase()}

      {/* Creator Controls */}
      {isCreator && activePhase !== MeetingResponseDtoCurrentPhase.finished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={vm.handleNextPhase}
            disabled={vm.isChangingPhase}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-300/50 hover:shadow-3xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {vm.isChangingPhase ? 'Переключение...' : 'Следующая фаза'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </>
  );
};
