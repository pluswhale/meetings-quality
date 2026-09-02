import { useMemo } from 'react';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import type {
  MeetingParticipantRefDto,
  MeetingResponseDto,
  UserResponseDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { UseMeetingPresenceReturn, SocketParticipant } from '../state/meetingDetail.types';
import type { ActiveParticipantsResponse } from '../api/meeting-room.api';
import { useMeetingStore, selectParticipants, selectIsConnected } from '../store/useMeetingStore';
import { hasUsableParticipantLabel, participantDisplayName } from '../lib';

const asUserId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return null;
};

/**
 * Derives the meeting roster and live presence.
 *
 * Roster membership comes from the meeting document, not from the socket:
 * being invited and being currently connected are different things, and the
 * phase forms need everyone who was invited. Presence is exposed separately as
 * `onlineUserIds` so it can be displayed without affecting who is listed.
 *
 * Names are merged from the meeting payload, the user directory, and the
 * live socket so a missing populate or empty fullName cannot blank the rows.
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
  const invitedIds = useMemo(() => {
    const ids: string[] = [];
    const push = (id: string | null) => {
      if (id && !ids.includes(id)) ids.push(id);
    };
    push(asUserId(meeting?.creatorId));
    (invited ?? []).forEach((ref) => push(asUserId(ref._id)));
    (meeting?.participantIds ?? []).forEach((id) => push(asUserId(id)));
    return ids;
  }, [meeting?.creatorId, invited, meeting?.participantIds]);

  const rosterNeedsDirectory = useMemo(() => {
    if (invitedIds.length === 0) return true;
    if (!invited?.length) return true;
    return invited.some((ref) => !hasUsableParticipantLabel(ref));
  }, [invited, invitedIds.length]);

  const { data: allUsers = [] } = useUsersControllerFindAll({
    query: { enabled: rosterNeedsDirectory, staleTime: 30_000 },
  });

  const onlineUserIds = useMemo(
    () => new Set(socketParticipants.map((p) => p.userId)),
    [socketParticipants],
  );

  const meetingParticipants = useMemo<UserResponseDto[]>(() => {
    const byId = new Map<string, UserResponseDto>();

    const upsert = (
      id: string | null,
      fullName?: string | null,
      email?: string | null,
    ) => {
      if (!id) return;
      const prev = byId.get(id);
      const label = participantDisplayName(
        { fullName, email },
        prev?.fullName || prev?.email || '',
      );
      byId.set(id, {
        _id: id,
        fullName: label || 'Участник',
        email: email?.trim() || prev?.email || '',
      });
    };

    invited?.forEach((ref: MeetingParticipantRefDto) =>
      upsert(asUserId(ref._id), ref.fullName, ref.email),
    );
    if (meeting?.creatorId) {
      upsert(
        asUserId(meeting.creatorId._id),
        meeting.creatorId.fullName,
        meeting.creatorId.email,
      );
    }
    (meeting?.participantIds ?? []).forEach((id) => upsert(asUserId(id)));
    allUsers.forEach((u) => upsert(u._id, u.fullName, u.email));
    socketParticipants.forEach((p) => upsert(p.userId, p.fullName, p.email));
    if (currentUserId && !byId.has(currentUserId)) {
      const self = allUsers.find((u) => u._id === currentUserId);
      upsert(currentUserId, self?.fullName, self?.email);
    }

    const order = invitedIds.length > 0 ? invitedIds : [...byId.keys()];
    return order.map((id) => byId.get(id)).filter((u): u is UserResponseDto => Boolean(u));
  }, [
    invited,
    meeting?.creatorId,
    meeting?.participantIds,
    allUsers,
    socketParticipants,
    currentUserId,
    invitedIds,
  ]);

  const activeParticipants = useMemo<ActiveParticipantsResponse | null>(() => {
    if (!socketParticipants.length) return null;

    return {
      meetingId,
      activeParticipants: socketParticipants.map((p) => ({
        _id: p.userId,
        fullName: participantDisplayName(p),
        email: p.email ?? '',
        isActive: true,
        joinedAt: p.joinedAt,
        lastSeen: p.lastSeen,
      })),
      totalParticipants: invitedIds.length,
      activeCount: socketParticipants.length,
    };
  }, [socketParticipants, meetingId, invitedIds.length]);

  return {
    socketParticipants: socketParticipants as SocketParticipant[],
    isSocketConnected: isConnected,
    meetingParticipants,
    onlineUserIds,
    activeParticipants,
    allUsers,
  };
};
