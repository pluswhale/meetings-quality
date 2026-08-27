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
 * Derives the meeting roster and live presence.
 *
 * Roster membership comes from the meeting document, not from the socket:
 * being invited and being currently connected are different things, and the
 * phase forms need everyone who was invited. Presence is exposed separately as
 * `onlineUserIds` so it can be displayed without affecting who is listed.
 *
 * useMeetingSocket handles the socket connection; this hook only reads the store.
 */
export const useMeetingPresence = (
  meetingId: string,
  meeting: MeetingResponseDto | undefined,
  currentUserId: string | undefined,
): UseMeetingPresenceReturn => {
  const socketParticipants = useMeetingStore(selectParticipants);
  const isConnected = useMeetingStore(selectIsConnected);

  const invited = meeting?.participants;
  const hasInvitedRoster = Boolean(invited?.length);

  // Only the fallback path below needs the full user list, so the meeting room
  // does not request it when the meeting document already carries the roster.
  const { data: allUsers = [] } = useUsersControllerFindAll({
    query: { enabled: !hasInvitedRoster },
  });

  const onlineUserIds = useMemo(
    () => new Set(socketParticipants.map((p) => p.userId)),
    [socketParticipants],
  );

  const meetingParticipants = useMemo<UserResponseDto[]>(() => {
    if (invited?.length) {
      // fullName and email are nullable on the ref, so fall back to something
      // renderable rather than an empty row.
      return invited.map((ref) => ({
        _id: ref._id,
        fullName: ref.fullName ?? ref.email ?? 'Участник',
        email: ref.email ?? '',
      }));
    }

    // Fallback for a backend that predates `participants` on the response: the
    // roster degrades to whoever is currently connected. Drops invited-but-
    // absent participants, which is the bug this field was added to fix, but it
    // keeps the room usable while the two sides deploy independently.
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
  }, [invited, socketParticipants, allUsers, currentUserId]);

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
    onlineUserIds,
    activeParticipants,
    allUsers,
  };
};
