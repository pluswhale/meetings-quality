/**
 * useMeetingDetailViewModel — composer for the live meeting room.
 *
 * Architecture (v3 — live-vote):
 *   - useMeetingSocket: connects Socket.IO, wires all WS events to Zustand,
 *     and exposes emitUpdateLiveVote for all client→server live updates.
 *   - Zustand (useMeetingStore): single source of truth for live state.
 *   - React Query: REST data only (meeting metadata, statistics, task list).
 *   - Phase hooks: read from Zustand, emit via socket. No submit buttons.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { MeetingDetailViewModel } from './types';
import { isUserCreator } from './lib';

import { useMeetingData } from './hooks/useMeetingData';
import { useMeetingPresence } from './hooks/useMeetingPresence';
import { useMeetingSocket } from './hooks/useMeetingSocket';
import { useMeetingSubmissions } from './hooks/useMeetingSubmissions';
import { useMeetingPhase } from './hooks/useMeetingPhase';
import { useEmotionalEvaluation } from './hooks/useEmotionalEvaluation';
import { useUnderstandingContribution } from './hooks/useUnderstandingContribution';
import { useTaskPlanning } from './hooks/useTaskPlanning';
import { useTaskEvaluation } from './hooks/useTaskEvaluation';
import { useTaskApproval } from './hooks/useTaskApproval';
import { useMeetingConclusions } from './hooks/useMeetingConclusions';
import { usePendingVoters } from './hooks/usePendingVoters';
import { useMeetingStore } from './store/useMeetingStore';

export const useMeetingDetailViewModel = (meetingId: string): MeetingDetailViewModel => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const handleNavigateBack = useCallback(() => navigate('/dashboard'), [navigate]);

  const { meeting, statistics, isLoading } = useMeetingData(meetingId);
  const isCreator = isUserCreator(meeting ?? null, currentUser?._id);

  const socket = useMeetingSocket(meetingId);

  const { socketParticipants, meetingParticipants, onlineUserIds, activeParticipants, allUsers } =
    useMeetingPresence(meetingId, meeting, currentUser?._id);

  const { submissions: phaseSubmissions, isLoading: isLoadingSubmissions } = useMeetingSubmissions(
    meetingId,
    isCreator,
  );

  const { pendingVoters } = usePendingVoters(
    meetingId,
    isCreator,
    meeting?.currentPhase,
    socketParticipants,
  );

  const {
    viewedPhase,
    activePhase,
    isChangingPhase,
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
  } = useMeetingPhase({
    meetingId,
    currentPhase: meeting?.currentPhase,
    projectId: meeting?.projectId,
    isCreator,
    socket,
  });

  // ─── Phase hooks ────────────────────────────────────────────────────────────

  const {
    emotionalEvaluations,
    setEmotionalEvaluations,
    handleLiveUpdate: handleLiveUpdateEmotional,
  } = useEmotionalEvaluation(meetingId, socket);

  const {
    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,
    handleLiveUpdate: handleLiveUpdateUnderstanding,
  } = useUnderstandingContribution(meetingId, socket);

  const {
    tasks: planningTasks,
    addTask: addPlanningTask,
    removeTask: removePlanningTask,
    updateTask: updatePlanningTask,
    onChangeEstimateHours,
    isTaskApproved: isPlanningTaskApproved,
    isDraftComplete: isPlanningDraftComplete,
    taskEmotionalScale,
    setTaskEmotionalScale,
    isTaskPlanningValid,
    handleLiveUpdate: handleLiveUpdateTaskPlanning,
  } = useTaskPlanning(meetingId, currentUser?._id, socket);

  const { conclusions, onConclusionsChange } = useMeetingConclusions(socket, isCreator);

  const {
    taskEvaluations,
    setTaskEvaluations,
    evaluableTasks,
    handleLiveUpdate: handleLiveUpdateTaskEvaluation,
  } = useTaskEvaluation(meetingId, socket);

  const { isApprovingTask, handleApproveTask } = useTaskApproval(meetingId);

  // Suppress unused variable warning — socketParticipants drives presence
  void useMeetingStore;

  return {
    meeting,
    meetingId: meeting?._id,
    statistics,
    allUsers,
    meetingParticipants,
    onlineUserIds,
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

    planningTasks,
    addPlanningTask,
    removePlanningTask,
    updatePlanningTask,
    onChangeEstimateHours,
    isPlanningTaskApproved,
    isPlanningDraftComplete,
    taskEmotionalScale,
    setTaskEmotionalScale,
    isTaskPlanningValid,
    conclusions,
    onConclusionsChange,
    isMyTaskApproved: planningTasks.some((t) => isPlanningTaskApproved(t.taskKey)),
    handleApproveTask,
    isApprovingTask,

    taskEvaluations,
    setTaskEvaluations,
    evaluableTasks,

    isChangingPhase,

    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
    handleLiveUpdateEmotional,
    handleLiveUpdateUnderstanding,
    handleLiveUpdateTaskPlanning,
    handleLiveUpdateTaskEvaluation,
    handleNavigateBack,
  };
};
