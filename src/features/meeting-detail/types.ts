/**
 * Types for MeetingDetail feature
 */

import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ActiveParticipantsResponse } from './api/meeting-room.api';
import type { MeetingSubmissions } from '@/src/features/meeting/types';

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
  taskDescription: string;
  commonQuestion: string;
  estimateHours: string;
  onChangeEstimateHours: React.Dispatch<React.SetStateAction<string>>;
  setCommonQuestion: React.Dispatch<React.SetStateAction<string>>;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  deadline: string;
  setDeadline: React.Dispatch<React.SetStateAction<string>>;
  expectedContribution: number;
  setExpectedContribution: React.Dispatch<React.SetStateAction<number>>;
  taskEmotionalScale: number;
  setTaskEmotionalScale: React.Dispatch<React.SetStateAction<number>>;

  // Phase 4 state
  taskEvaluations: Record<string, number>;
  setTaskEvaluations: React.Dispatch<React.SetStateAction<Record<string, number>>>;

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
  handleLiveUpdateTaskEvaluation: (authorId: string, score: number) => void;

  handleNavigateBack: () => void;
}
