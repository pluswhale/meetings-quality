/**
 * useMeetingDetailViewModel — thin composer.
 *
 * This hook exists solely for backward compatibility with MeetingDetailView.tsx.
 * All logic has been extracted into focused hooks under ./hooks/.
 * New code should use MeetingDetailContainer instead of this hook.
 *
 * @see src/features/meeting-detail/containers/MeetingDetailContainer.tsx
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import toast from 'react-hot-toast';
import { MeetingDetailViewModel } from './types';
import { isUserCreator } from './lib';
import type { SocketUpdateType } from './state/meetingDetail.types';

import { useMeetingData } from './hooks/useMeetingData';
import { useMeetingPresence } from './hooks/useMeetingPresence';
import { useMeetingSocket } from './hooks/useMeetingSocket';
import { useMeetingSubmissions } from './hooks/useMeetingSubmissions';
import { usePendingVoters } from './hooks/usePendingVoters';
import { useMeetingPhase } from './hooks/useMeetingPhase';
import { useEmotionalEvaluation } from './hooks/useEmotionalEvaluation';
import { useUnderstandingContribution } from './hooks/useUnderstandingContribution';
import { useTaskPlanning } from './hooks/useTaskPlanning';
import { useTaskEvaluation } from './hooks/useTaskEvaluation';
import { useTaskApproval } from './hooks/useTaskApproval';

const SOCKET_NOTIFICATION_MESSAGES: Partial<Record<SocketUpdateType, string>> = {
  emotional_evaluation_updated: 'Получена новая эмоциональная оценка!',
  understanding_contribution_updated: 'Получена новая оценка понимания!',
  task_planning_updated: 'Получена новая задача!',
  task_evaluation_updated: 'Получена новая оценка задачи!',
};

export const useMeetingDetailViewModel = (meetingId: string): MeetingDetailViewModel => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const handleNavigateBack = useCallback(() => navigate('/dashboard'), [navigate]);

  // ─── Core data ─────────────────────────────────────────────────────────────
  const { meeting, statistics, isLoading } = useMeetingData(meetingId);
  const isCreator = isUserCreator(meeting ?? null, currentUser?._id);

  // ─── Presence ───────────────────────────────────────────────────────────────
  const { socketParticipants, meetingParticipants, activeParticipants, allUsers } =
    useMeetingPresence(meetingId, meeting, currentUser?._id);

  // ─── Socket event → query invalidation ─────────────────────────────────────
  const handleSocketNotification = useCallback((type: SocketUpdateType) => {
    const message = SOCKET_NOTIFICATION_MESSAGES[type] ?? 'Получено новое обновление!';
    toast.success(message, { icon: '✨', duration: 3000 });
  }, []);

  useMeetingSocket(meetingId, { isCreator, onNotification: handleSocketNotification });

  // ─── Creator data ────────────────────────────────────────────────────────────
  const { submissions: phaseSubmissions, isLoading: isLoadingSubmissions } =
    useMeetingSubmissions(meetingId, isCreator);

  const { pendingVoters } = usePendingVoters(
    meetingId, isCreator, meeting?.currentPhase, socketParticipants,
  );

  // ─── Phase navigation ────────────────────────────────────────────────────────
  const {
    viewedPhase,
    activePhase,
    isChangingPhase,
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
  } = useMeetingPhase(meetingId, meeting?.currentPhase, isCreator);

  // ─── Phase hooks ─────────────────────────────────────────────────────────────
  const {
    emotionalEvaluations,
    setEmotionalEvaluations,
    isSubmitting: isSubmittingEmotional,
    handleSubmit: handleSubmitEmotionalEvaluation,
    handleAutoSave: handleAutoSaveEmotionalEvaluation,
  } = useEmotionalEvaluation(meetingId);

  const {
    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,
    isSubmitting: isSubmittingUnderstanding,
    handleSubmit: handleSubmitUnderstandingContribution,
    handleAutoSave: handleAutoSaveUnderstandingContribution,
  } = useUnderstandingContribution(meetingId);

  const {
    taskDescription,
    setTaskDescription,
    commonQuestion,
    setCommonQuestion,
    estimateHours,
    onChangeEstimateHours,
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,
    taskEmotionalScale,
    setTaskEmotionalScale,
    handleAutoSaveTaskEmotionalScale,
    isMyTaskApproved,
    isSubmitting: isSubmittingTask,
    handleSubmit: handleSubmitTaskPlanning,
  } = useTaskPlanning(meetingId, currentUser?._id);

  const {
    taskEvaluations,
    setTaskEvaluations,
    isSubmitting: isSubmittingTaskEvaluation,
    handleSubmit: handleSubmitTaskEvaluation,
  } = useTaskEvaluation(meetingId);

  const { isApprovingTask, handleApproveTask } = useTaskApproval(meetingId);

  return {
    meeting,
    meetingId: meeting?._id,
    statistics,
    allUsers,
    meetingParticipants,
    votingInfo: null,
    phaseSubmissions,
    activeParticipants,
    pendingVoters,

    isLoading,
    isLoadingSubmissions,
    isCreator,
    activePhase,
    viewedPhase,

    emotionalEvaluations,
    setEmotionalEvaluations,

    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,

    taskDescription,
    setTaskDescription,
    estimateHours,
    onChangeEstimateHours,
    commonQuestion,
    setCommonQuestion,
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,
    taskEmotionalScale,
    setTaskEmotionalScale,
    handleAutoSaveTaskEmotionalScale,
    isMyTaskApproved,
    handleApproveTask,
    isApprovingTask,

    taskEvaluations,
    setTaskEvaluations,

    isSubmittingEmotional,
    isSubmittingUnderstanding,
    isSubmittingTask,
    isSubmittingTaskEvaluation,
    isCreatingTask: false,
    isChangingPhase,

    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
    handleSubmitEmotionalEvaluation,
    handleAutoSaveEmotionalEvaluation,
    handleSubmitUnderstandingContribution,
    handleAutoSaveUnderstandingContribution,
    handleSubmitTaskPlanning,
    handleSubmitTaskEvaluation,
    handleNavigateBack,
  };
};
