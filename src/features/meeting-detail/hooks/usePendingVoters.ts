import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPendingVoters } from '../api/pending-voters.api';
import { meetingDetailQueryKeys } from './queryKeys';
import { POLLING_INTERVALS } from '@/src/shared/constants';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import type { SocketParticipant, UsePendingVotersReturn } from '../state/meetingDetail.types';

/**
 * Creator-only hook for the list of participants who haven't submitted yet.
 *
 * Merges the REST response with the real-time socket participant list to
 * annotate each pending voter with an `isOnline` flag — avoids a separate
 * round-trip to determine online status.
 */
export const usePendingVoters = (
  meetingId: string,
  isCreator: boolean,
  currentPhase: MeetingResponseDtoCurrentPhase | undefined,
  socketParticipants: SocketParticipant[],
): UsePendingVotersReturn => {
  const isFinished = currentPhase === MeetingResponseDtoCurrentPhase.finished;

  const { data: pendingVotersData } = useQuery({
    queryKey: meetingDetailQueryKeys.pendingVoters(meetingId),
    queryFn: () => getPendingVoters(meetingId),
    enabled: Boolean(isCreator && !isFinished && meetingId),
    refetchInterval: POLLING_INTERVALS.VOTING_INFO,
  });

  const pendingVoters = useMemo(() => {
    if (!pendingVotersData?.pendingParticipants) return [];

    const onlineIds = new Set(socketParticipants.map((p) => p.userId));

    return pendingVotersData.pendingParticipants.map((participant) => ({
      ...participant,
      isOnline: onlineIds.has(participant._id),
    }));
  }, [pendingVotersData, socketParticipants]);

  return { pendingVoters };
};
