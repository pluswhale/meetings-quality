/**
 * PhaseContent — Routes to phase-specific live forms (Phases 1-4).
 *
 * Live-vote model: no submit buttons anywhere.
 * Every slider release / field blur fires onLiveUpdate → user:update_live_vote.
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { EmotionalEvaluationTable } from './EmotionalEvaluationTable';
import { UnderstandingScorePanel } from './UnderstandingScorePanel';
import { ContributionDistributionPanel } from './ContributionDistributionPanel';
import { TaskPlanningForm } from './TaskPlanningForm';
import { TaskEmotionalScaleSlider } from './TaskEmotionalScaleSlider';
import { MeetingDetailViewModel } from '../types';

interface PhaseContentProps {
  vm: MeetingDetailViewModel;
}

export const PhaseContent: React.FC<PhaseContentProps> = ({ vm }) => {
  const { meeting, isCreator, activePhase } = vm;
  const { currentUser } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activePhase]);

  const renderEmotionalEvaluationPhase = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <EmotionalEvaluationTable
        currentUser={currentUser}
        participants={vm.meetingParticipants}
        evaluations={vm.emotionalEvaluations}
        onUpdateEvaluation={(id, update) =>
          vm.setEmotionalEvaluations((prev) => ({
            ...prev,
            // Always preserve emotionalScale: 0 so the payload field is never undefined.
            [id]: { emotionalScale: 0, isToxic: false, ...prev[id], ...update },
          }))
        }
        onLiveUpdate={vm.handleLiveUpdateEmotional}
      />
    </div>
  );

  const renderUnderstandingContributionPhase = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <ContributionDistributionPanel
        participants={vm.meetingParticipants}
        contributions={vm.contributions}
        onContributionChange={(id, value) =>
          vm.setContributions((prev) => ({ ...prev, [id]: value }))
        }
        onLiveUpdate={vm.handleLiveUpdateUnderstanding}
        totalContribution={vm.totalContribution}
      />
    </div>
  );

  const renderTaskPlanningPhase = () => (
    <div className="space-y-12">
      <TaskPlanningForm
        estimateHours={vm.estimateHours}
        onEstimateHoursChange={vm.onChangeEstimateHours}
        commonQuestion={vm.commonQuestion}
        onCommonQuestionChange={vm.setCommonQuestion}
        taskDescription={vm.taskDescription}
        onTaskDescriptionChange={vm.setTaskDescription}
        deadline={vm.deadline}
        onDeadlineChange={vm.setDeadline}
        expectedContribution={vm.expectedContribution}
        onExpectedContributionChange={vm.setExpectedContribution}
        onLiveUpdate={vm.handleLiveUpdateTaskPlanning}
        isApproved={vm.isMyTaskApproved}
      />

      <TaskEmotionalScaleSlider
        value={vm.taskEmotionalScale}
        onChange={vm.setTaskEmotionalScale}
        onAutoSave={vm.handleLiveUpdateTaskPlanning}
        disabled={vm.isMyTaskApproved}
      />
    </div>
  );

  return (
    <>
      {/* Meeting question */}
      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
        <div className="p-10 md:p-14">
          <h3 className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.3em]">
            Центральный вопрос
          </h3>
          <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {meeting.question}
          </p>
        </div>
      </div>

      {/* Understanding score — always visible in active phases */}
      {activePhase !== MeetingResponseDtoCurrentPhase.finished &&
       activePhase !== MeetingResponseDtoCurrentPhase.retrospective && (
        <UnderstandingScorePanel
          understandingScore={vm.understandingScore}
          onUnderstandingScoreChange={vm.setUnderstandingScore}
          onAutoSave={vm.handleLiveUpdateUnderstanding}
        />
      )}

      {/* Phase-specific content */}
      {activePhase === MeetingResponseDtoCurrentPhase.emotional_evaluation &&
        renderEmotionalEvaluationPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.understanding_contribution &&
        renderUnderstandingContributionPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.task_planning && renderTaskPlanningPhase()}

      {/* Creator phase-advance control */}
      {isCreator && activePhase !== MeetingResponseDtoCurrentPhase.finished && (
        <motion.div
          ref={bottomRef}
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
            {vm.isChangingPhase
              ? 'Переключение...'
              : vm.meeting.currentPhase === MeetingResponseDtoCurrentPhase.task_planning
                ? 'Завершить'
                : 'Следующая фаза'}
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

      {!isCreator && <div ref={bottomRef} />}
    </>
  );
};
