import { useMemo } from 'react';
import {
  useMeetingStore,
  selectPendingVoters,
  selectParticipants,
} from '../store/useMeetingStore';
import type { MeetingResponseDtoCurrentPhase } from '@/src/shared/constants';
import type { UsePendingVotersReturn } from '../state/meetingDetail.types';

/**
 * Derives the pending-voters list directly from the Zustand meeting store.
 *
 * The store is kept in sync by the WebSocket events:
 *   - room:pending_voters_updated  → setPendingVoters()
 *   - room:participants_updated    → setParticipants()
 *
 * No REST polling. No refetchInterval.
 */
export const usePendingVoters = (
  _meetingId: string,
  _isCreator: boolean,
  currentPhase: MeetingResponseDtoCurrentPhase | undefined,
  // socketParticipants is no longer needed — data comes from the store
  _socketParticipants: unknown[],
): UsePendingVotersReturn => {
  const storePending = useMeetingStore(selectPendingVoters);
  const storeParticipants = useMeetingStore(selectParticipants);
  const submittedIds = useMeetingStore((s) => s.submittedUserIds);

  const isFinished = currentPhase === 'finished';

  const pendingVoters = useMemo(() => {
    if (isFinished) return [];

    // If the WS store has pending data, use it directly (already annotated).
    if (storePending.length > 0 || submittedIds.length > 0) {
      const submittedSet = new Set(submittedIds);
      return storeParticipants
        .filter((p) => !submittedSet.has(p.userId))
        .map((p) => ({
          _id: p.userId,
          fullName: p.fullName ?? '',
          email: p.email ?? '',
          isOnline: true,
          joinedAt: p.joinedAt,
          lastSeen: p.lastSeen ?? p.joinedAt,
        }));
    }

    return [];
  }, [storePending, storeParticipants, submittedIds, isFinished]);

  return { pendingVoters };
};
