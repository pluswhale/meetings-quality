import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useMeetingsControllerChangePhase } from '@/src/shared/api/generated/meetings/meetings';
import {
  MeetingResponseDtoCurrentPhase,
  ChangePhaseDtoPhase,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
import { getNextPhase } from '../lib';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingPhaseReturn } from '../state/meetingDetail.types';

/**
 * Manages the meeting phase lifecycle for the creator.
 *
 * Two modes:
 *   - Creator: calls the changePhase mutation (server-side state change).
 *   - Participant: sets `viewedPhase` client-side only — no network request.
 *
 * `viewedPhase` allows participants to re-visit and edit previous submissions
 * without altering the canonical meeting phase.
 */
export const useMeetingPhase = (
  meetingId: string,
  currentPhase: MeetingResponseDtoCurrentPhase | undefined,
  isCreator: boolean,
): UseMeetingPhaseReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewedPhase, setViewedPhase] = useState<MeetingResponseDtoCurrentPhase | null>(null);

  const activePhase = viewedPhase ?? currentPhase;

  const { mutate: changePhase, isPending: isChangingPhase } = useMeetingsControllerChangePhase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
      },
      onError: (err) => {
        const message = extractMessage(err);
        toast.error(`Ошибка: ${message}`);
      },
    },
  });

  const handleNextPhase = () => {
    if (!currentPhase) return;

    const nextPhase = getNextPhase(currentPhase);
    if (!nextPhase) return;

    changePhase(
      { id: meetingId, data: { phase: nextPhase as ChangePhaseDtoPhase } },
      {
        onSuccess: (response) => {
          if (response.currentPhase === MeetingResponseDtoCurrentPhase.finished) {
            navigate('/meeting/create');
          }
        },
      },
    );
  };

  const handleChangeToPhase = (targetPhase: MeetingResponseDtoCurrentPhase) => {
    if (!currentPhase) return;

    if (isCreator) {
      changePhase(
        { id: meetingId, data: { phase: targetPhase as ChangePhaseDtoPhase } },
        {
          onSuccess: () => {
            toast.success(`Фаза изменена на: ${PHASE_LABELS[targetPhase]}`);
          },
        },
      );
      return;
    }

    // Participants may only view phases that have already happened.
    const currentIndex = PHASE_ORDER.indexOf(currentPhase);
    const targetIndex = PHASE_ORDER.indexOf(targetPhase);

    if (targetIndex >= currentIndex) {
      toast.error('Вы можете вернуться только к предыдущим этапам');
      return;
    }

    setViewedPhase(targetPhase);
    toast.success(`Просмотр этапа: ${PHASE_LABELS[targetPhase]}`);
  };

  const handleReturnToCurrentPhase = () => {
    setViewedPhase(null);
    toast.success('Возврат к текущему этапу');
  };

  return {
    viewedPhase,
    activePhase,
    isChangingPhase,
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? 'Не удалось изменить фазу';
  }
  return 'Не удалось изменить фазу';
}
