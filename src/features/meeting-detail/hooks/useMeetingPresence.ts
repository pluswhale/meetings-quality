import { useMemo } from 'react';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import type {
  MeetingResponseDto,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { UseMeetingPresenceReturn, SocketParticipant } from '../state/meetingDetail.types';
import type { ActiveParticipantsResponse } from '../api/meeting-room.api';
import { useSocket } from './useSocket';

/**
 * Derives the real-time participant lists from the Socket.IO connection.
 *
 * Responsibilities:
 *   - Owns the socket connection lifecycle via useSocket.
 *   - Derives `meetingParticipants` (UserResponseDto[]) by cross-referencing
 *     socket participants with the full user list.
 *   - Builds the legacy `activeParticipants` response shape expected by the view.
 *   - Ensures the current user is always included if they're active.
 *
 * Pure derivation — no side effects, no mutations.
 */
export const useMeetingPresence = (
  meetingId: string,
  meeting: MeetingResponseDto | undefined,
  currentUserId: string | undefined,
): UseMeetingPresenceReturn => {
  const { isConnected, participants: socketParticipants } = useSocket(meetingId);
  const { data: allUsers = [] } = useUsersControllerFindAll();

  const meetingParticipants = useMemo<UserResponseDto[]>(() => {
    if (!socketParticipants.length || !allUsers.length) return [];

    const activeIds = new Set(socketParticipants.map((p) => p.userId));
    const active = allUsers.filter((u) => activeIds.has(u._id));

    // Guarantee the current user is present if they are in the socket list.
    if (currentUserId && activeIds.has(currentUserId) && !active.some((u) => u._id === currentUserId)) {
      const self = allUsers.find((u) => u._id === currentUserId);
      if (self) active.push(self);
    }

    return active;
  }, [socketParticipants, allUsers, currentUserId]);

  const activeParticipants = useMemo<ActiveParticipantsResponse | null>(() => {
    if (!socketParticipants.length) return null;

    return {
      meetingId,
      activeParticipants: socketParticipants.map((p) => ({
        _id: p.userId,
        fullName: p.fullName ?? '',
        email: p.email ?? '',
        isActive: true,
        joinedAt: p.joinedAt instanceof Date ? p.joinedAt.toISOString() : String(p.joinedAt),
        lastSeen: p.lastSeen
          ? p.lastSeen instanceof Date
            ? p.lastSeen.toISOString()
            : String(p.lastSeen)
          : undefined,
      })),
      totalParticipants: meeting?.participantIds?.length ?? 0,
      activeCount: socketParticipants.length,
    };
  }, [socketParticipants, meetingId, meeting?.participantIds]);

  return {
    socketParticipants: socketParticipants as SocketParticipant[],
    isSocketConnected: isConnected,
    meetingParticipants,
    activeParticipants,
    allUsers,
  };
};
