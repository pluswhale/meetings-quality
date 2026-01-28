/**
 * PhaseContent - Routes to appropriate phase content based on current phase
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { CreatorWarningBanner } from '@/src/shared/components';
import { EmotionalEvaluationTable } from './EmotionalEvaluationTable';
import { UnderstandingScorePanel } from './UnderstandingScorePanel';
import { ContributionDistributionPanel } from './ContributionDistributionPanel';
import { TaskPlanningForm } from './TaskPlanningForm';
import { TaskEvaluationForm } from './TaskEvaluationForm';
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
        <EmotionalEvaluationTable
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
    </div>
  );

  const renderUnderstandingContributionPhase = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!isCreator ? (
        <>
          <ContributionDistributionPanel
            participants={vm.meetingParticipants}
            contributions={vm.contributions}
            onContributionChange={(id, value) =>
              vm.setContributions((prev) => ({ ...prev, [id]: value }))
            }
            totalContribution={vm.totalContribution}
          />
          <button
            onClick={vm.handleSubmitUnderstandingContribution}
            disabled={vm.isSubmittingUnderstanding}
            className="w-full py-4 md:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[16px] md:rounded-[24px] font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {vm.isSubmittingUnderstanding ? 'Сохранение...' : 'Сохранить оценку понимания и вклада'}
          </button>
        </>
      ) : (
        <CreatorWarningBanner />
      )}
    </div>
  );

  const renderTaskPlanningPhase = () => (
    <div className="space-y-12">
      {!isCreator ? (
        <TaskPlanningForm
          commonQuestion={vm.commonQuestion}
          onCommonQuestionChange={vm.setCommonQuestion}
          taskDescription={vm.taskDescription}
          onTaskDescriptionChange={vm.setTaskDescription}
          deadline={vm.deadline}
          onDeadlineChange={vm.setDeadline}
          expectedContribution={vm.expectedContribution}
          onExpectedContributionChange={vm.setExpectedContribution}
          onSubmit={vm.handleSubmitTaskPlanning}
          isSubmitting={vm.isSubmittingTask || vm.isCreatingTask}
        />
      ) : (
        <CreatorWarningBanner />
      )}
    </div>
  );

  const renderTaskEvaluationPhase = () => {
    // Collect all tasks from taskPlannings with author information
    const tasksToEvaluate = meeting?.taskPlannings?.map((taskPlanning: any) => {
      const author = vm.allUsers.find((u) => u._id === taskPlanning.participantId);
      return {
        authorId: taskPlanning.participantId,
        author: author || null,
        taskDescription: taskPlanning.taskDescription,
        commonQuestion: taskPlanning.commonQuestion || meeting.question,
        deadline: taskPlanning.deadline,
        originalContribution: taskPlanning.expectedContributionPercentage,
      };
    }) || [];

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <TaskEvaluationForm
          tasks={tasksToEvaluate}
          onSubmit={vm.handleSubmitTaskEvaluation}
          isSubmitting={vm.isSubmittingTaskEvaluation}
          existingEvaluation={vm.taskEvaluations}
        />
      </div>
    );
  };

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
       
      </div>

      {/* Understanding Score Panel - Always visible for participants (except finished) */}
      {!isCreator && activePhase !== MeetingResponseDtoCurrentPhase.finished && (
        <UnderstandingScorePanel
          understandingScore={vm.understandingScore}
          onUnderstandingScoreChange={vm.setUnderstandingScore}
        />
      )}

      {/* Phase-specific content */}
      {activePhase === MeetingResponseDtoCurrentPhase.emotional_evaluation &&
        renderEmotionalEvaluationPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.understanding_contribution &&
        renderUnderstandingContributionPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.task_planning &&
        renderTaskPlanningPhase()}
      {activePhase === MeetingResponseDtoCurrentPhase.task_evaluation &&
        renderTaskEvaluationPhase()}

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
