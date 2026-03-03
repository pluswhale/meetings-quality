import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { submitTaskEvaluation } from '../api/task-evaluation.api';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseTaskEvaluationReturn } from '../state/meetingDetail.types';

/**
 * Phase 5 — Task Evaluation.
 *
 * Owns the importance score map (keyed by authorId) and the submit handler.
 *
 * Why not use the generated mutation hook?
 * The Orval-generated client types the response as `void` for this endpoint.
 * The manual `submitTaskEvaluation` wrapper in task-evaluation.api.ts uses
 * the correct return type (MeetingResponseDto). This will be replaced with
 * the generated hook once the OpenAPI spec is updated.
 */
export const useTaskEvaluation = (meetingId: string): UseTaskEvaluationReturn => {
  const queryClient = useQueryClient();
  const [taskEvaluations, setTaskEvaluations] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (evaluations: Record<string, number>) => {
      if (!meetingId) return;

      const evaluationList = Object.entries(evaluations).map(([authorId, score]) => ({
        taskAuthorId: authorId,
        importanceScore: score,
      }));

      if (evaluationList.length === 0) {
        toast.error('Нет задач для оценки');
        return;
      }

      setIsSubmitting(true);
      try {
        await submitTaskEvaluation(meetingId, { evaluations: evaluationList });
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
        toast.success('Оценки важности задач сохранены!');
        setTaskEvaluations(evaluations);
      } catch (err) {
        toast.error(`Ошибка: ${extractMessage(err)}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [meetingId, queryClient],
  );

  return { taskEvaluations, setTaskEvaluations, isSubmitting, handleSubmit };
};

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? 'Не удалось сохранить оценки';
  }
  return 'Не удалось сохранить оценки';
}
