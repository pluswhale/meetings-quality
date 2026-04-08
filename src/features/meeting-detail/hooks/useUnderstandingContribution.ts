import { useMemo, useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import { calculateContributionTotal } from '../lib';
import type { ContributionsMap, UseUnderstandingContributionReturn } from '../state/meetingDetail.types';

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
