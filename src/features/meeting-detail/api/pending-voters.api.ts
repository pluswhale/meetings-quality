/**
 * Pending Voters API
 * GET /meetings/:id/pending-voters
 * Returns list of participants who haven't submitted their vote yet
 */

import customInstance from '@/src/shared/api/axios-instance';

export interface PendingParticipant {
  _id: string;
  fullName: string;
  email: string;
  joinedAt: string;
  lastSeen: string;
}

export interface PendingVotersResponse {
  meetingId: string;
  phase: string;
  pendingCount: number;
  pendingParticipants: PendingParticipant[];
}

/**
 * Fetch list of participants who haven't submitted their vote yet
 * GET /meetings/:id/pending-voters
 * Only accessible by meeting creator
 */
export const getPendingVoters = async (meetingId: string): Promise<PendingVotersResponse> => {
  try {
    const response = await customInstance<PendingVotersResponse>({
      url: `/meetings/${meetingId}/pending-voters`,
      method: 'GET',
    });
    return response;
  } catch (error: any) {
    // Handle 403 - Only creator can access
    if (error?.response?.status === 403) {
      console.warn('⚠️ Only meeting creator can view pending voters.');
      throw error;
    }
    // If endpoint doesn't exist yet, return empty result
    if (error?.response?.status === 404) {
      console.warn('⚠️ Endpoint /pending-voters not found.');
      return {
        meetingId,
        phase: '',
        pendingCount: 0,
        pendingParticipants: [],
      };
    }
    throw error;
  }
};
