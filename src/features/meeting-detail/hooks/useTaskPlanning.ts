import { useState, useCallback, useMemo } from 'react';
import { useTasksControllerFindAll } from '@/src/shared/api/generated/tasks/tasks';
import { meetingDetailQueryKeys } from './queryKeys';
import type { UseMeetingSocketReturn } from './useMeetingSocket';
import type { UseTaskPlanningReturn } from '../state/meetingDetail.types';
import { useMeetingStore } from '../store/useMeetingStore';

/**
 * Phase 3 — Task Planning.
 *
 * Every field blur / slider release fires handleLiveUpdate → emitUpdateLiveVote.
 * Data persists to Redis immediately; flushed to MongoDB when the creator
 * advances from this phase.
 * No submit button.
 */
export const useTaskPlanning = (
  meetingId: string,
  currentUserId: string | undefined,
  socket: UseMeetingSocketReturn,
): UseTaskPlanningReturn => {
  const { data: userTasks = [] } = useTasksControllerFindAll(undefined, {
    query: {
      queryKey: meetingDetailQueryKeys.userTasks(),
      enabled: Boolean(currentUserId),
      staleTime: 10_000,
    },
  });

  const myTask = useMemo(
    () => userTasks.find((t) => t.meetingId._id === meetingId),
    [userTasks, meetingId],
  );

  const myTaskApprovedFromWs = useMeetingStore((s) => s.myTaskApproved);
  const isMyTaskApproved = myTaskApprovedFromWs || (myTask?.approved ?? false);

  const [taskDescription, setTaskDescription] = useState(myTask?.description ?? '');
  const [commonQuestion, setCommonQuestion] = useState(myTask?.commonQuestion ?? '');
  const [estimateHours, setEstimateHours] = useState(
    myTask?.estimateHours != null ? String(myTask.estimateHours) : '',
  );
  const [deadline, setDeadline] = useState(
    myTask?.deadline ? new Date(myTask.deadline).toISOString().split('T')[0] : '',
  );
  const [expectedContribution, setExpectedContribution] = useState(
    myTask?.contributionImportance ?? 50,
  );
  const [taskEmotionalScale, setTaskEmotionalScale] = useState(50);

  const buildPayload = useCallback(
    () => ({
      taskDescription,
      commonQuestion,
      deadline: deadline ? new Date(deadline).toISOString() : '',
      expectedContributionPercentage: expectedContribution,
      estimateHours: estimateHours === '' ? 0 : Number(estimateHours),
    }),
    [taskDescription, commonQuestion, deadline, expectedContribution, estimateHours],
  );

  const handleLiveUpdate = useCallback(() => {
    socket.emitUpdateLiveVote('task_planning', buildPayload());
  }, [buildPayload, socket]);

  const onChangeEstimateHours = useCallback((v: string) => {
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setEstimateHours(v);
    }
  }, []);

  return {
    taskDescription,
    setTaskDescription,
    commonQuestion,
    setCommonQuestion,
    estimateHours,
    onChangeEstimateHours,
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,
    taskEmotionalScale,
    setTaskEmotionalScale,
    isMyTaskApproved,
    handleLiveUpdate,
  };
};
