/**
 * Domain types for the meeting-detail feature.
 *
 * These are the per-hook return types. Keep them here so every hook imports
 * from one place rather than defining inline interfaces.
 *
 * Do NOT import from this file inside the generated API layer — only
 * feature-level code should reference these.
 */

import type {
  MeetingResponseDto,
  MeetingResponseDtoCurrentPhase,
  StatisticsResponseDto,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import type { PendingParticipant } from '../api/pending-voters.api';
import type { ActiveParticipantsResponse } from '../api/meeting-room.api';

// ─── Socket ───────────────────────────────────────────────────────────────────

export interface SocketParticipant {
  userId: string;
  fullName: string | null;
  email: string | null;
  joinedAt: Date;
  lastSeen?: Date;
}

/** Subset of socket event types that trigger UI updates. */
export type SocketUpdateType =
  | 'task_approved'
  | 'task_updated'
  | 'emotional_evaluation_updated'
  | 'understanding_contribution_updated'
  | 'task_planning_updated'
  | 'task_evaluation_updated';

export const VOTING_UPDATE_TYPES = new Set<SocketUpdateType>([
  'emotional_evaluation_updated',
  'understanding_contribution_updated',
  'task_planning_updated',
  'task_evaluation_updated',
]);

export const TASK_UPDATE_TYPES = new Set<SocketUpdateType>([
  'task_approved',
  'task_updated',
]);

// ─── Presence ─────────────────────────────────────────────────────────────────

export interface PendingVoterWithStatus extends PendingParticipant {
  isOnline: boolean;
}

// ─── Phase form state ─────────────────────────────────────────────────────────

export interface EmotionalEvaluationEntry {
  emotionalScale: number;
  isToxic: boolean;
}

/** keyed by participantId */
export type EmotionalEvaluationsMap = Record<string, EmotionalEvaluationEntry>;

/** keyed by participantId, value is 0–100 */
export type ContributionsMap = Record<string, number>;

// ─── Hook return types ────────────────────────────────────────────────────────

export interface UseMeetingDataReturn {
  meeting: MeetingResponseDto | undefined;
  statistics: StatisticsResponseDto | undefined;
  isLoading: boolean;
  isFinished: boolean;
}

export interface UseMeetingPresenceReturn {
  socketParticipants: SocketParticipant[];
  isSocketConnected: boolean;
  meetingParticipants: UserResponseDto[];
  activeParticipants: ActiveParticipantsResponse | null;
  allUsers: UserResponseDto[];
}

// useMeetingSocket has no return values — it is a pure side-effect hook.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type UseMeetingSocketReturn = Record<string, never>;

export interface UseMeetingSubmissionsReturn {
  submissions: MeetingSubmissions | null;
  isLoading: boolean;
  isRefreshing: boolean;
}

export interface UsePendingVotersReturn {
  pendingVoters: PendingVoterWithStatus[];
}

export interface UseMeetingPhaseReturn {
  viewedPhase: MeetingResponseDtoCurrentPhase | null;
  activePhase: MeetingResponseDtoCurrentPhase | undefined;
  isChangingPhase: boolean;
  handleNextPhase: () => void;
  handleChangeToPhase: (phase: MeetingResponseDtoCurrentPhase) => void;
  handleReturnToCurrentPhase: () => void;
}

export interface UseEmotionalEvaluationReturn {
  emotionalEvaluations: EmotionalEvaluationsMap;
  setEmotionalEvaluations: React.Dispatch<React.SetStateAction<EmotionalEvaluationsMap>>;
  isSubmitting: boolean;
  handleSubmit: () => void;
  handleAutoSave: () => void;
}

export interface UseUnderstandingContributionReturn {
  understandingScore: number;
  setUnderstandingScore: React.Dispatch<React.SetStateAction<number>>;
  contributions: ContributionsMap;
  setContributions: React.Dispatch<React.SetStateAction<ContributionsMap>>;
  totalContribution: number;
  isSubmitting: boolean;
  handleSubmit: () => void;
  handleAutoSave: () => void;
}

export interface UseTaskPlanningReturn {
  taskDescription: string;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  commonQuestion: string;
  setCommonQuestion: React.Dispatch<React.SetStateAction<string>>;
  estimateHours: string;
  onChangeEstimateHours: (v: string) => void;
  deadline: string;
  setDeadline: React.Dispatch<React.SetStateAction<string>>;
  expectedContribution: number;
  setExpectedContribution: React.Dispatch<React.SetStateAction<number>>;
  taskEmotionalScale: number;
  setTaskEmotionalScale: React.Dispatch<React.SetStateAction<number>>;
  handleAutoSaveTaskEmotionalScale: () => void;
  isMyTaskApproved: boolean;
  isSubmitting: boolean;
  handleSubmit: () => void;
}

export interface UseTaskEvaluationReturn {
  taskEvaluations: Record<string, number>;
  setTaskEvaluations: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isSubmitting: boolean;
  handleSubmit: (evaluations: Record<string, number>) => Promise<void>;
}

export interface UseTaskApprovalReturn {
  isApprovingTask: boolean;
  handleApproveTask: (taskId: string, currentApproved: boolean) => void;
}
