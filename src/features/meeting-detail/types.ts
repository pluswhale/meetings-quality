/**
 * Types for MeetingDetail feature
 */

import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ActiveParticipantsResponse } from './api/meeting-room.api';
import type { MeetingSubmissions } from '@/src/features/meeting/types';
import type { PlanningTaskDraft, EvaluableTask } from './state/meetingDetail.types';

export interface EmotionalEvaluationState {
  emotionalScale: number;
  isToxic: boolean;
}

export interface EmotionalEvaluationsMap {
  [participantId: string]: EmotionalEvaluationState;
}

export interface ContributionsMap {
  [participantId: string]: number;
}

export interface VotingInfo {
  meetingId?: string;
  currentPhase?: string;
  participants?: Array<{ _id: string }>;
  submissionStatus?: {
    phase?: string;
    submitted?: string[];
  };
}

/** @deprecated Use MeetingSubmissions from @/src/features/meeting/types instead. */
export type PhaseSubmissions = MeetingSubmissions;

export interface PendingVoter {
  _id: string;
  fullName: string;
  email: string;
  isOnline?: boolean;
}

export interface MeetingDetailViewModel {
  // Data
  meeting: any;
  meetingId: string;
  isMyTaskApproved: boolean;
  handleApproveTask: (taskId: string, currentStatus: boolean) => void;
  isApprovingTask: boolean;
  statistics: any;
  allUsers: UserResponseDto[];
  meetingParticipants: UserResponseDto[];
  /** Ids of participants currently connected to the room. */
  onlineUserIds: Set<string>;
  votingInfo: VotingInfo | null;
  phaseSubmissions: MeetingSubmissions | null;
  activeParticipants: ActiveParticipantsResponse | null;
  pendingVoters: PendingVoter[];

  // State
  isLoading: boolean;
  isLoadingSubmissions: boolean;
  isCreator: boolean;
  activePhase: any;
  viewedPhase: any | null;

  // Phase 1 state
  emotionalEvaluations: EmotionalEvaluationsMap;
  setEmotionalEvaluations: React.Dispatch<React.SetStateAction<EmotionalEvaluationsMap>>;

  // Phase 2 state
  understandingScore: number;
  setUnderstandingScore: React.Dispatch<React.SetStateAction<number>>;
  contributions: ContributionsMap;
  setContributions: React.Dispatch<React.SetStateAction<ContributionsMap>>;
  totalContribution: number;

  // Phase 3 state
  planningTasks: PlanningTaskDraft[];
  addPlanningTask: () => void;
  removePlanningTask: (taskKey: string) => void;
  updatePlanningTask: (taskKey: string, patch: Partial<PlanningTaskDraft>) => void;
  onChangeEstimateHours: (taskKey: string, v: string) => void;
  isPlanningTaskApproved: (taskKey: string) => boolean;
  isPlanningDraftComplete: (task: PlanningTaskDraft) => boolean;
  taskEmotionalScale: number;
  setTaskEmotionalScale: React.Dispatch<React.SetStateAction<number>>;
  isTaskPlanningValid: boolean;
  conclusions: string;
  onConclusionsChange: (value: string) => void;

  // Phase 4 state
  taskEvaluations: Record<string, number>;
  setTaskEvaluations: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  evaluableTasks: EvaluableTask[];

  // Mutations
  isChangingPhase: boolean;

  // Phase navigation
  handleNextPhase: () => void;
  handleChangeToPhase: (phase: any) => void;
  handleReturnToCurrentPhase: () => void;

  // Live update handlers (fire user:update_live_vote on slider release / field blur)
  handleLiveUpdateEmotional: () => void;
  handleLiveUpdateUnderstanding: () => void;
  handleLiveUpdateTaskPlanning: () => void;
  handleLiveUpdateTaskEvaluation: (taskId: string, score: number) => void;

  handleNavigateBack: () => void;
}
