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
  StatisticsResponseDto,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import type { PendingParticipant } from '../api/pending-voters.api';
import type { ActiveParticipantsResponse } from '../api/meeting-room.api';

// ─── Socket ───────────────────────────────────────────────────────────────────

export interface SocketParticipant {
  userId: string;
  fullName: string | null;
  email: string | null;
  joinedAt: string;
  lastSeen?: string;
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
  /** Ids of participants currently connected to the room. */
  onlineUserIds: Set<string>;
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
  handleViewPrevPhase: () => void;
  handleViewNextPhase: () => void;
}

export interface UseEmotionalEvaluationReturn {
  emotionalEvaluations: EmotionalEvaluationsMap;
  setEmotionalEvaluations: React.Dispatch<React.SetStateAction<EmotionalEvaluationsMap>>;
  /** Fires on every slider release / checkbox change — persists immediately. */
  handleLiveUpdate: () => void;
}

export interface UseUnderstandingContributionReturn {
  understandingScore: number;
  setUnderstandingScore: React.Dispatch<React.SetStateAction<number>>;
  contributions: ContributionsMap;
  setContributions: React.Dispatch<React.SetStateAction<ContributionsMap>>;
  totalContribution: number;
  /** Fires on every slider release — persists immediately. */
  handleLiveUpdate: () => void;
}

export interface PlanningTaskDraft {
  taskKey: string;
  description: string;
  estimateHours: string;
  deadline: string;
  expectedContribution: number;
}

export interface UseTaskPlanningReturn {
  tasks: PlanningTaskDraft[];
  addTask: () => void;
  removeTask: (taskKey: string) => void;
  updateTask: (taskKey: string, patch: Partial<PlanningTaskDraft>) => void;
  onChangeEstimateHours: (taskKey: string, v: string) => void;
  isTaskApproved: (taskKey: string) => boolean;
  isDraftComplete: (task: PlanningTaskDraft) => boolean;
  taskEmotionalScale: number;
  setTaskEmotionalScale: React.Dispatch<React.SetStateAction<number>>;
  /** True when at least one task is complete and persisted. */
  isTaskPlanningValid: boolean;
  /** Fires on every field blur / slider release — persists complete tasks. */
  handleLiveUpdate: () => void;
}

export interface EvaluableTask {
  _id: string;
  description: string;
  authorId: string;
  authorName: string;
}

export interface UseTaskEvaluationReturn {
  taskEvaluations: Record<string, number>;
  setTaskEvaluations: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  evaluableTasks: EvaluableTask[];
  /** Fires on every slider release — persists immediately. */
  handleLiveUpdate: (taskId: string, score: number) => void;
}

export interface UseTaskApprovalReturn {
  isApprovingTask: boolean;
  handleApproveTask: (taskId: string, currentApproved: boolean) => void;
}
