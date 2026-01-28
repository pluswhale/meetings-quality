/**
 * Meeting Room API - Manual API calls for join/leave/active-participants/all-submissions
 * These will be replaced with generated types once OpenAPI spec is updated
 */

import { customInstance } from '@/src/shared/api/axios-instance';
import { MeetingResponseDto, UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

// ====================
// Types (manually defined until OpenAPI is updated)
// ====================

export interface ActiveParticipant extends UserResponseDto {
  isActive: boolean;
  joinedAt: string;
  lastSeen?: string;
}

export interface ActiveParticipantsResponse {
  meetingId: string;
  activeParticipants: ActiveParticipant[];
  totalParticipants: number;
  activeCount: number;
}

export interface ParticipantInfo {
  _id: string;
  fullName: string;
  email: string;
}

export interface EmotionalEvaluationData {
  participant: ParticipantInfo;
  submitted: boolean;
  submittedAt?: string;
  evaluations?: Array<{
    targetParticipant: { _id: string; fullName: string };
    emotionalScale: number;
    isToxic: boolean;
  }>;
}

export interface UnderstandingContributionData {
  participant: ParticipantInfo;
  submitted: boolean;
  submittedAt?: string;
  understandingScore?: number;
  contributions?: Array<{
    participant: { _id: string; fullName: string };
    contributionPercentage: number;
  }>;
}

export interface TaskPlanningData {
  participant: ParticipantInfo;
  submitted: boolean;
  submittedAt?: string;
  taskDescription?: string;
  deadline?: string;
  expectedContributionPercentage?: number;
}

export interface AllSubmissionsResponse {
  meetingId: string;
  submissions: {
    emotional_evaluation?: Record<string, EmotionalEvaluationData>;
    understanding_contribution?: Record<string, UnderstandingContributionData>;
    task_planning?: Record<string, TaskPlanningData>;
  };
}

// ====================
// API Functions
// ====================

/**
 * Join a meeting room (mark participant as active)
 */
export const joinMeeting = async (meetingId: string) => {
  return customInstance<MeetingResponseDto>({
    url: `/meetings/${meetingId}/join`,
    method: 'POST',
  });
};

/**
 * Leave a meeting room (mark participant as inactive)
 */
export const leaveMeeting = async (meetingId: string) => {
  return customInstance<MeetingResponseDto>({
    url: `/meetings/${meetingId}/leave`,
    method: 'POST',
  });
};

/**
 * Get list of active participants in meeting room
 */
export const getActiveParticipants = async (meetingId: string) => {
  return customInstance<ActiveParticipantsResponse>({
    url: `/meetings/${meetingId}/active-participants`,
    method: 'GET',
  });
};

/**
 * Get all submissions from all phases (simplified format for creator)
 */
export const getAllSubmissions = async (meetingId: string) => {
  return customInstance<AllSubmissionsResponse>({
    url: `/meetings/${meetingId}/all-submissions`,
    method: 'GET',
  });
};
