import { useMemo, useCallback, useEffect } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import { calculateContributionTotal } from '../lib';
import type { ContributionsMap, UseUnderstandingContributionReturn } from '../state/meetingDetail.types';
import { useAuthStore } from '@/src/shared/store/auth.store';

/**
 * Phase 2 — Understanding & Contribution.
 *
 * Every slider release fires handleLiveUpdate → emitUpdateLiveVote.
 * No submit button, no manual confirmation.
 */
export const useUnderstandingContribution = (
  _meetingId: string,
  socket: UseMeetingSocketReturn,
): UseUnderstandingContributionReturn => {
  const understandingScore = useMeetingStore((s) => s.understandingScore);
  const contributions = useMeetingStore((s) => s.contributions);
  const setUnderstandingScore = useMeetingStore((s) => s.setUnderstandingScore);
  const setContributionEntry = useMeetingStore((s) => s.setContribution);
  const currentUserId = useAuthStore((s) => s.currentUser?._id);
  const phase = useMeetingStore((s) => s.phase);
  const ownVote = useMeetingStore((s) =>
    currentUserId ? s.votesByPhase.understanding_contribution?.[currentUserId] : undefined,
  );

  useEffect(() => {
    if (!currentUserId || !ownVote?.payload) return;
    const current = useMeetingStore.getState().contributions;
    if (Object.keys(current).length > 0) return;
    const score = ownVote.payload.understandingScore;
    if (typeof score === 'number') setUnderstandingScore(score);
    const list = ownVote.payload.contributions as
      | Array<{ participantId: string; contributionPercentage: number }>
      | undefined;
    list?.forEach((c) => setContributionEntry(c.participantId, c.contributionPercentage));
  }, [currentUserId, ownVote, phase, setUnderstandingScore, setContributionEntry]);

  const totalContribution = useMemo(
    () => calculateContributionTotal(contributions),
    [contributions],
  );

  const setContributions = useCallback(
    (updater: React.SetStateAction<ContributionsMap>) => {
      const next = typeof updater === 'function' ? updater(contributions) : updater;
      Object.entries(next).forEach(([pid, val]) => setContributionEntry(pid, val));
    },
    [contributions, setContributionEntry],
  );

  const buildContributionList = useCallback(
    () =>
      Object.entries(contributions).map(([participantId, contributionPercentage]) => ({
        participantId,
        contributionPercentage,
      })),
    [contributions],
  );

  const handleLiveUpdate = useCallback(() => {
    socket.emitUpdateLiveVote('understanding_contribution', {
      understandingScore,
      contributions: buildContributionList(),
    });
  }, [understandingScore, buildContributionList, socket]);

  return {
    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,
    handleLiveUpdate,
  };
};
