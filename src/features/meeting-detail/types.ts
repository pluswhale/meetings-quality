/**
 * Types for MeetingDetail feature
 */

import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ActiveParticipantsResponse } from './api/meeting-room.api';

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

export interface PhaseSubmissions {
  emotional_evaluation?: Record<string, any>;
  understanding_contribution?: Record<string, any>;
  task_planning?: Record<string, any>;
}

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
  phaseSubmissions: PhaseSubmissions | null;
  activeParticipants: ActiveParticipantsResponse | null;
  pendingVoters: PendingVoter[];

  // State
  isLoading: boolean;
  isCreator: boolean;
  activePhase: any; // The phase currently being viewed (could be previous for participants)
  viewedPhase: any | null; // For participants viewing previous phases

  // Phase 2 state
  emotionalEvaluations: EmotionalEvaluationsMap;
  setEmotionalEvaluations: React.Dispatch<React.SetStateAction<EmotionalEvaluationsMap>>;

  // Phase 3 state
  understandingScore: number;
  setUnderstandingScore: React.Dispatch<React.SetStateAction<number>>;
  contributions: ContributionsMap;
  setContributions: React.Dispatch<React.SetStateAction<ContributionsMap>>;
  totalContribution: number;

  // Phase 4 state
  taskDescription: string;
  commonQuestion: string;
  setCommonQuestion: React.Dispatch<React.SetStateAction<string>>;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  deadline: string;
  setDeadline: React.Dispatch<React.SetStateAction<string>>;
  expectedContribution: number;
  setExpectedContribution: React.Dispatch<React.SetStateAction<number>>;
  taskEmotionalScale: number;
  setTaskEmotionalScale: React.Dispatch<React.SetStateAction<number>>;
  handleAutoSaveTaskEmotionalScale: () => void;

  // Phase 5 state (task evaluation)
  taskEvaluations: Record<string, number>;
  setTaskEvaluations: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Mutations
  isSubmittingEmotional: boolean;
  isSubmittingUnderstanding: boolean;
  isSubmittingTask: boolean;
  isSubmittingTaskEvaluation: boolean;
  isCreatingTask: boolean;
  isChangingPhase: boolean;

  // Handlers
  handleNextPhase: () => void;
  handleChangeToPhase: (phase: any) => void;
  handleReturnToCurrentPhase: () => void;
  handleSubmitEmotionalEvaluation: () => void;
  handleAutoSaveEmotionalEvaluation: () => void;
  handleSubmitUnderstandingContribution: () => void;
  handleAutoSaveUnderstandingContribution: () => void;
  handleSubmitTaskPlanning: () => void;
  handleSubmitTaskEvaluation: (evaluations: Record<string, number>) => Promise<void>;
  handleNavigateBack: () => void;
}
