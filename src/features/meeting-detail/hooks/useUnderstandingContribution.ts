import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useMeetingsControllerSubmitUnderstandingContribution } from '@/src/shared/api/generated/meetings/meetings';
import type { ContributionInfluenceDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { isContributionTotalValid, calculateContributionTotal } from '../lib';
import { meetingDetailQueryKeys } from './queryKeys';
import type { ContributionsMap, UseUnderstandingContributionReturn } from '../state/meetingDetail.types';

/**
 * Phase 3 — Understanding & Contribution.
 *
 * Owns:
 *   - `understandingScore` (self-assessment, 0–100).
 *   - `contributions` map (how much each other participant contributed).
 *   - Derived `totalContribution` for the percentage bar.
 *   - Submit handler (validates total = 100% before sending).
 *   - Auto-save handler (silent, no validation).
 *
 * Validation logic lives in lib/meeting.utils.ts — this hook delegates rather
 * than inlining business rules.
 */
export const useUnderstandingContribution = (meetingId: string): UseUnderstandingContributionReturn => {
  const queryClient = useQueryClient();
  const [understandingScore, setUnderstandingScore] = useState(50);
  const [contributions, setContributions] = useState<ContributionsMap>({});

  const totalContribution = useMemo(
    () => calculateContributionTotal(contributions),
    [contributions],
  );

  const { mutate, isPending } = useMeetingsControllerSubmitUnderstandingContribution({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
      },
    },
  });

  const buildContributionList = useCallback((): ContributionInfluenceDto[] =>
    Object.entries(contributions).map(([participantId, pct]) => ({
      participantId,
      contributionPercentage: Number(pct),
    })), [contributions]);

  const handleSubmit = useCallback(() => {
    const contributionList = buildContributionList();

    if (contributionList.length === 0) {
      toast.error('Пожалуйста, распределите вклад участников');
      return;
    }

    if (!isContributionTotalValid(contributions)) {
      toast.error(`Общий вклад должен быть равен 100%. Сейчас: ${totalContribution.toFixed(1)}%`);
      return;
    }

    mutate(
      { id: meetingId, data: { understandingScore, contributions: contributionList } },
      {
        onSuccess: () => toast.success('Понимание и вклад сохранены!'),
        onError: (err) => toast.error(`Ошибка: ${extractMessage(err)}`),
      },
    );
  }, [meetingId, mutate, understandingScore, contributions, buildContributionList, totalContribution]);

  const handleAutoSave = useCallback(() => {
    mutate(
      { id: meetingId, data: { understandingScore, contributions: buildContributionList() } },
      { onError: (err) => console.error('Auto-save failed:', err) },
    );
  }, [meetingId, mutate, understandingScore, buildContributionList]);

  return {
    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,
    isSubmitting: isPending,
    handleSubmit,
    handleAutoSave,
  };
};

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? 'Не удалось сохранить данные';
  }
  return 'Не удалось сохранить данные';
}
