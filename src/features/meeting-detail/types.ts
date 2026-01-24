/**
 * Types for MeetingDetail feature
 */

import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

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
  emotionalEvaluations?: Record<string, any>;
  understandingContributions?: Record<string, any>;
  taskPlannings?: Record<string, any>;
}

export interface MeetingDetailViewModel {
  // Data
  meeting: any;
  statistics: any;
  allUsers: UserResponseDto[];
  meetingParticipants: UserResponseDto[];
  votingInfo: VotingInfo | null;
  phaseSubmissions: PhaseSubmissions | null;
  
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
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  deadline: string;
  setDeadline: React.Dispatch<React.SetStateAction<string>>;
  expectedContribution: number;
  setExpectedContribution: React.Dispatch<React.SetStateAction<number>>;
  
  // Mutations
  isSubmittingEmotional: boolean;
  isSubmittingUnderstanding: boolean;
  isSubmittingTask: boolean;
  isCreatingTask: boolean;
  isChangingPhase: boolean;
  
  // Handlers
  handleNextPhase: () => void;
  handleChangeToPhase: (phase: any) => void;
  handleReturnToCurrentPhase: () => void;
  handleSubmitEmotionalEvaluation: () => void;
  handleSubmitUnderstandingContribution: () => void;
  handleSubmitTaskPlanning: () => void;
  handleNavigateBack: () => void;
}
