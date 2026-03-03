/**
 * Meeting Room API — manual wrappers for join/leave/active-participants.
 *
 * All-submissions types have been moved to src/features/meeting/types.ts
 * and the API call to src/features/meeting/api.ts.
 * Import from there for any submission-related types.
 */

import { customInstance } from '@/src/shared/api/axios-instance';
import type { MeetingResponseDto, UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

// Re-export from the canonical location so existing imports keep working
// while the codebase migrates to direct imports.
export type {
  MeetingSubmissionsResponse as AllSubmissionsResponse,
  MeetingSubmissions,
  EmotionalSubmission as EmotionalEvaluationData,
  UnderstandingSubmission as UnderstandingContributionData,
  TaskSubmission as TaskPlanningData,
} from '@/src/features/meeting/types';

// ====================
// Active-participants types (not yet in OpenAPI spec)
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

// getAllSubmissions has been moved to src/features/meeting/api.ts
// Use: import { getMeetingSubmissions } from '@/src/features/meeting/api';
