import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import customInstance from '@/src/shared/api/axios-instance';
import type { TaskResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseTaskApprovalReturn } from '../state/meetingDetail.types';

/**
 * Creator-only mutation for toggling task approval status.
 *
 * Separated from task-planning because:
 *   - Only the creator ever calls this.
 *   - It invalidates a different set of queries (submissions + tasks, not the form).
 *   - It has its own loading state that the approval checkbox needs.
 *
 * The mutation is a PATCH to /tasks/:id/approve with { approved: !current }.
 * This endpoint is not yet in the OpenAPI spec, so we call customInstance directly.
 * Replace with the generated hook once Orval regenerates.
 */
export const useTaskApproval = (meetingId: string): UseTaskApprovalReturn => {
  const queryClient = useQueryClient();

  const { mutate: approveTask, isPending } = useMutation<
    TaskResponseDto,
    unknown,
    { taskId: string; currentApproved: boolean }
  >({
    mutationFn: ({ taskId, currentApproved }) =>
      customInstance<TaskResponseDto>({
        url: `/tasks/${taskId}/approve`,
        method: 'PATCH',
        data: { approved: !currentApproved },
      }),
    onSuccess: (data) => {
      const approved = data?.approved;
      toast.success(approved ? 'Задача одобрена' : 'Одобрение отменено');

      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.submissions(meetingId) });
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meeting(meetingId) });
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meetingTasks(meetingId) });
      queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.userTasks() });
    },
    onError: (err) => {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Не удалось обновить статус задачи';
      toast.error(message);
    },
  });

  const handleApproveTask = useCallback(
    (taskId: string, currentApproved: boolean) => {
      approveTask({ taskId, currentApproved });
    },
    [approveTask],
  );

  return { isApprovingTask: isPending, handleApproveTask };
};
