import { useMemo } from 'react';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import type {
  MeetingResponseDto,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { UseMeetingPresenceReturn, SocketParticipant } from '../state/meetingDetail.types';
import type { ActiveParticipantsResponse } from '../api/meeting-room.api';
import { useMeetingStore, selectParticipants, selectIsConnected } from '../store/useMeetingStore';

/**
 * Derives the real-time participant lists from the Zustand store (populated by WS events).
 *
 * useMeetingSocket handles the socket connection; this hook only reads the store.
 * No socket connection logic lives here — single responsibility.
 */
export const useMeetingPresence = (
  meetingId: string,
  meeting: MeetingResponseDto | undefined,
  currentUserId: string | undefined,
): UseMeetingPresenceReturn => {
  const socketParticipants = useMeetingStore(selectParticipants);
  const isConnected = useMeetingStore(selectIsConnected);
  const { data: allUsers = [] } = useUsersControllerFindAll();

  const meetingParticipants = useMemo<UserResponseDto[]>(() => {
    if (!socketParticipants.length || !allUsers.length) return [];
    const activeIds = new Set(socketParticipants.map((p) => p.userId));
    const active = allUsers.filter((u) => activeIds.has(u._id));

    if (
      currentUserId &&
      activeIds.has(currentUserId) &&
      !active.some((u) => u._id === currentUserId)
    ) {
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
        joinedAt: p.joinedAt,
        lastSeen: p.lastSeen,
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
