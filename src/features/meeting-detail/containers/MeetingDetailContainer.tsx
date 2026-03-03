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

import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
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
import { CreatorSubmissionsPanel } from '../components/CreatorSubmissionsPanel';
import { PendingVotersPanel } from '../components/PendingVotersPanel';

import type { SocketUpdateType } from '../state/meetingDetail.types';
import { isUserCreator } from '../lib';

// Notification messages keyed by socket update type.
const SOCKET_NOTIFICATION_MESSAGES: Partial<Record<SocketUpdateType, string>> = {
  emotional_evaluation_updated: 'Получена новая эмоциональная оценка!',
  understanding_contribution_updated: 'Получена новая оценка понимания!',
  task_planning_updated: 'Получена новая задача!',
  task_evaluation_updated: 'Получена новая оценка задачи!',
};

export const MeetingDetailContainer: React.FC = () => {
  const { id: meetingId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  // ─── Core data ───────────────────────────────────────────────────────────
  const { meeting, statistics, isLoading } = useMeetingData(meetingId);
  const isCreator = isUserCreator(meeting ?? null, currentUser?._id);

  // ─── Presence ────────────────────────────────────────────────────────────
  const { socketParticipants, isSocketConnected, meetingParticipants, activeParticipants, allUsers } =
    useMeetingPresence(meetingId, meeting, currentUser?._id);

  // ─── Socket events → query invalidation ──────────────────────────────────
  const handleSocketNotification = useCallback((type: SocketUpdateType) => {
    const message = SOCKET_NOTIFICATION_MESSAGES[type] ?? 'Получено новое обновление!';
    toast.success(message, { icon: '✨', duration: 3000 });
  }, []);

  useMeetingSocket(meetingId, {
    isCreator,
    onNotification: handleSocketNotification,
  });

  // ─── Creator-only data ───────────────────────────────────────────────────
  const { submissions: phaseSubmissions, isLoading: isLoadingSubmissions, isRefreshing } =
    useMeetingSubmissions(meetingId, isCreator);

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
  } = useMeetingPhase(meetingId, meeting?.currentPhase, isCreator);

  // ─── Phase form hooks ────────────────────────────────────────────────────
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

  if (meeting.currentPhase === MeetingResponseDtoCurrentPhase.finished) {
    return <FinishedPhaseView meeting={meeting} onBack={handleNavigateBack} />;
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

      {!isCreator && viewedPhase && (
        <ViewingPreviousPhaseAlert onReturn={handleReturnToCurrentPhase} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-12"
      >
        {isCreator &&
          meeting.currentPhase !== MeetingResponseDtoCurrentPhase.emotional_evaluation && (
            <PendingVotersPanel
              pendingVoters={pendingVoters}
              isLoading={!pendingVoters.length}
              currentPhase={meeting.currentPhase}
            />
          )}

        {isCreator && (
          <CreatorSubmissionsPanel
            isApprovingTask={isApprovingTask}
            onApproveTask={handleApproveTask}
            submissions={phaseSubmissions}
            isLoading={!phaseSubmissions}
            isRefreshing={isRefreshing}
          />
        )}

        <PhaseContent vm={vm} />
      </motion.div>
    </motion.div>
  );
};

// ─── Inline sub-component ─────────────────────────────────────────────────────

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
