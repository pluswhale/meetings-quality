/**
 * MeetingDetailContainer
 *
 * The single assembly point for all meeting-detail hooks. Its only
 * responsibilities are:
 *   1. Read meetingId from the router.
 *   2. Call each domain hook.
 *   3. Build the MeetingDetailViewModel shape expected by the view.
 *   4. Handle page-level routing (loading / not-found / finished).
 *
 * Rules enforced here:
 *   - No business logic (validation, formatting, domain rules).
 *   - No data fetching (all in hooks).
 *   - Toast for socket notifications is here because it is UI coordination,
 *     not domain logic — the hook delivers the type, the container reacts.
 */

import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import { useAuthStore } from '@/src/shared/store/auth.store';

// ─── Domain hooks ─────────────────────────────────────────────────────────────
import { useMeetingData } from '../hooks/useMeetingData';
import { useMeetingPresence } from '../hooks/useMeetingPresence';
import { useMeetingSocket } from '../hooks/useMeetingSocket';
import { useMeetingSubmissions } from '../hooks/useMeetingSubmissions';
import { usePendingVoters } from '../hooks/usePendingVoters';
import { useMeetingPhase } from '../hooks/useMeetingPhase';
import { useEmotionalEvaluation } from '../hooks/useEmotionalEvaluation';
import { useUnderstandingContribution } from '../hooks/useUnderstandingContribution';
import { useTaskPlanning } from '../hooks/useTaskPlanning';
import { useTaskEvaluation } from '../hooks/useTaskEvaluation';
import { useTaskApproval } from '../hooks/useTaskApproval';

// ─── View components ──────────────────────────────────────────────────────────
import { MeetingHeader } from '../components/MeetingHeader';
import { FinishedPhaseView } from '../components/FinishedPhaseView';
import { PhaseContent } from '../components/PhaseContent';
import { RetroPhaseView } from '../components/RetroPhaseView';
import { CreatorAdminPanel } from '../components/CreatorAdminPanel';

import { isUserCreator } from '../lib';
import { selectPhase, useMeetingStore } from '../store/useMeetingStore';

export const MeetingDetailContainer: React.FC = () => {
  const { id: meetingId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  // ─── Core data ───────────────────────────────────────────────────────────
  const { meeting, statistics, isLoading } = useMeetingData(meetingId);
  const isCreator = isUserCreator(meeting ?? null, currentUser?._id);

  // ─── Presence ────────────────────────────────────────────────────────────
  const {
    socketParticipants,
    isSocketConnected,
    meetingParticipants,
    activeParticipants,
    allUsers,
  } = useMeetingPresence(meetingId, meeting, currentUser?._id);

  // ─── WebSocket (single connection for the entire meeting room) ──────────
  const socket = useMeetingSocket(meetingId);

  // Live phase from WebSocket — null until first state_sync arrives
  const livePhase = useMeetingStore(selectPhase);
  const wsConnected = useMeetingStore((s) => s.isConnected);
  const wsReconnecting = useMeetingStore((s) => s.isReconnecting);

  // ─── Creator-only data ───────────────────────────────────────────────────
  const {
    submissions: phaseSubmissions,
    isLoading: isLoadingSubmissions,
    isRefreshing,
  } = useMeetingSubmissions(meetingId, isCreator);

  const { pendingVoters } = usePendingVoters(
    meetingId,
    isCreator,
    meeting?.currentPhase,
    socketParticipants,
  );

  // ─── Phase navigation ────────────────────────────────────────────────────
  const {
    viewedPhase,
    activePhase,
    isChangingPhase,
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
  } = useMeetingPhase(meetingId, meeting?.currentPhase, isCreator, socket);

  // ─── Phase form hooks ────────────────────────────────────────────────────
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
    isMyTaskApproved,
    handleLiveUpdate: handleLiveUpdateTaskPlanning,
  } = useTaskPlanning(meetingId, currentUser?._id, socket);

  const {
    taskEvaluations,
    setTaskEvaluations,
    handleLiveUpdate: handleLiveUpdateTaskEvaluation,
  } = useTaskEvaluation(meetingId, socket);

  const { isApprovingTask, handleApproveTask } = useTaskApproval(meetingId);

  const handleNavigateBack = useCallback(() => navigate('/dashboard'), [navigate]);

  // ─── Render guards ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500 font-bold">Загрузка встречи...</p>
      </div>
    );
  }

  if (!meeting) {
    return <div className="p-20 text-center text-slate-500 font-bold">Встреча не найдена</div>;
  }

  // Check finished state from both REST and live Zustand phase to avoid a
  // brief window where the socket says "finished" but the REST cache hasn't refreshed.
  if (
    meeting.currentPhase === MeetingResponseDtoCurrentPhase.finished ||
    livePhase === MeetingResponseDtoCurrentPhase.finished
  ) {
    return (
      <FinishedPhaseView
        meeting={meeting}
        meetingId={meetingId}
        isCreator={isCreator}
        onBack={handleNavigateBack}
      />
    );
  }

  // ─── Build the view-model shape expected by existing presentational components ──
  // This object is the adapter layer between fine-grained hooks and the
  // existing PhaseContent / PhaseSubmissionsDisplay components which take `vm`.
  const vm = {
    meeting,
    meetingId: meeting._id,
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
    isMyTaskApproved,
    handleApproveTask,
    isApprovingTask,

    taskEvaluations,
    setTaskEvaluations,

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6 md:p-12 pb-40"
    >
      <MeetingHeader
        meetingId={meetingId}
        title={meeting.title}
        createdAt={meeting.createdAt}
        currentPhase={activePhase}
        actualCurrentPhase={meeting.currentPhase}
        onBack={handleNavigateBack}
        isCreator={isCreator}
        onPhaseClick={handleChangeToPhase}
      />

      <SocketStatusBadge connected={wsConnected} reconnecting={wsReconnecting} />

      {!isCreator && viewedPhase && (
        <ViewingPreviousPhaseAlert onReturn={handleReturnToCurrentPhase} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-12"
      >
        {isCreator && <CreatorAdminPanel meetingId={meetingId} socket={socket} />}

        {/* Phase 0 — Retrospective: rendered when previousMeetingId is set */}
        {activePhase === MeetingResponseDtoCurrentPhase.retrospective ? (
          <RetroPhaseView socket={socket} isCreator={isCreator} />
        ) : (
          <PhaseContent vm={vm} />
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Inline sub-components ────────────────────────────────────────────────────

const SocketStatusBadge: React.FC<{ connected: boolean; reconnecting: boolean }> = ({
  connected,
  reconnecting,
}) => {
  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-4">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </div>
    );
  }
  if (reconnecting) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-4">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        Reconnecting…
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium mb-4">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      Disconnected
    </div>
  );
};

const ViewingPreviousPhaseAlert: React.FC<{ onReturn: () => void }> = ({ onReturn }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[32px] p-6 shadow-lg mb-12"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-black text-amber-900 text-lg">Вы просматриваете предыдущий этап</h3>
          <p className="text-sm font-bold text-amber-700 mt-1">
            Вы можете изменить свой ответ. Изменения сохранятся при отправке.
          </p>
        </div>
      </div>
      <button
        onClick={onReturn}
        className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-2xl transition-all hover:scale-105 whitespace-nowrap shadow-lg"
      >
        Вернуться к текущему
      </button>
    </div>
  </motion.div>
);
