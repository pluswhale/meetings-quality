import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useMeetingsControllerSubmitEmotionalEvaluation } from '@/src/shared/api/generated/meetings/meetings';
import type { ParticipantEmotionalEvaluationDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { meetingDetailQueryKeys } from './queryKeys';
import type { EmotionalEvaluationsMap, UseEmotionalEvaluationReturn } from '../state/meetingDetail.types';

/**
 * Phase 2 — Emotional Evaluation.
 *
 * Owns:
 *   - The `emotionalEvaluations` map state (keyed by participantId).
 *   - The explicit submit handler (shows validation toast on empty input).
 *   - The auto-save handler (silent — no toast, used on slider change).
 *
 * Does NOT own: participant list, phase routing, loading UI. Those belong
 * to `useMeetingPresence` and `useMeetingPhase` respectively.
 */
export const useEmotionalEvaluation = (meetingId: string): UseEmotionalEvaluationReturn => {
  const queryClient = useQueryClient();
  const [emotionalEvaluations, setEmotionalEvaluations] = useState<EmotionalEvaluationsMap>({});

  const { mutate, isPending } = useMeetingsControllerSubmitEmotionalEvaluation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
      },
    },
  });

  const buildEvaluationList = useCallback((): ParticipantEmotionalEvaluationDto[] =>
    Object.entries(emotionalEvaluations).map(([participantId, ev]) => ({
      targetParticipantId: participantId,
      emotionalScale: ev.emotionalScale,
      isToxic: ev.isToxic,
    })), [emotionalEvaluations]);

  const handleSubmit = useCallback(() => {
    const evaluations = buildEvaluationList();

    if (evaluations.length === 0) {
      toast.error('Пожалуйста, оцените хотя бы одного участника');
      return;
    }

    mutate(
      { id: meetingId, data: { evaluations } },
      {
        onSuccess: () => toast.success('Эмоциональная оценка сохранена!'),
        onError: (err) => toast.error(`Ошибка: ${extractMessage(err)}`),
      },
    );
  }, [meetingId, mutate, buildEvaluationList]);

  const handleAutoSave = useCallback(() => {
    const evaluations = buildEvaluationList();
    if (evaluations.length === 0) return;

    mutate(
      { id: meetingId, data: { evaluations } },
      { onError: (err) => console.error('Auto-save failed:', err) },
    );
  }, [meetingId, mutate, buildEvaluationList]);

  return {
    emotionalEvaluations,
    setEmotionalEvaluations,
    isSubmitting: isPending,
    handleSubmit,
    handleAutoSave,
  };
};

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? 'Не удалось сохранить оценку';
  }
  return 'Не удалось сохранить оценку';
}
