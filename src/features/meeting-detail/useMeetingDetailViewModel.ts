/**
 * ViewModel for MeetingDetail
 * Contains all business logic, state management, and data fetching
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { queryClient } from '@/src/app/providers/QueryProvider';
import {
  useMeetingsControllerFindOne,
  useMeetingsControllerGetStatistics,
  useMeetingsControllerChangePhase,
  useMeetingsControllerSubmitEmotionalEvaluation,
  useMeetingsControllerSubmitUnderstandingContribution,
  useMeetingsControllerSubmitTaskPlanning,
  useMeetingsControllerGetVotingInfo,
} from '@/src/shared/api/generated/meetings/meetings';
import { useTasksControllerCreate } from '@/src/shared/api/generated/tasks/tasks';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import {
  MeetingResponseDtoCurrentPhase,
  ChangePhaseDtoPhase,
  ParticipantEmotionalEvaluationDto,
  ContributionInfluenceDto,
} from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { POLLING_INTERVALS, PHASE_LABELS, PHASE_ORDER } from '@/src/shared/constants';
import { isUserCreator, getNextPhase } from './lib';
import { MeetingDetailViewModel, EmotionalEvaluationsMap, ContributionsMap } from './types';
import {
  getAllSubmissions,
  getActiveParticipants,
  ActiveParticipantsResponse,
} from './api/meeting-room.api';
import { useSocket } from './hooks';
import { submitTaskEvaluation, TaskImportanceEvaluationItem } from './api/task-evaluation.api';
import { getPendingVoters } from './api/pending-voters.api';
import customInstance from '@/src/shared/api/axios-instance';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useMeetingDetailViewModel = (meetingId: string): MeetingDetailViewModel => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  // Socket.IO for real-time participant presence
  const { isConnected: isSocketConnected, participants: socketParticipants } = useSocket(meetingId);

  // Fetch meeting data with polling
  const { data: meeting, isLoading } = useMeetingsControllerFindOne(meetingId, {
    query: {
      refetchInterval: POLLING_INTERVALS.MEETING_DATA,
      refetchIntervalInBackground: false,
      enabled: !!meetingId,
    },
  });

  // Fetch statistics for finished meetings
  const { data: statistics } = useMeetingsControllerGetStatistics(meetingId, {
    query: {
      enabled: meeting?.currentPhase === MeetingResponseDtoCurrentPhase.finished,
      refetchInterval:
        meeting?.currentPhase === MeetingResponseDtoCurrentPhase.finished
          ? POLLING_INTERVALS.STATISTICS
          : false,
    },
  });

  // Fetch all users
  const { data: allUsers = [] } = useUsersControllerFindAll();

  // Determine if current user is creator
  const isCreator = useMemo(() => isUserCreator(meeting, currentUser?._id), [meeting, currentUser]);

  // Fetch voting info for creator
  const { data: votingInfo } = useMeetingsControllerGetVotingInfo(meetingId, {
    query: {
      enabled: !!(isCreator && meeting?.currentPhase !== MeetingResponseDtoCurrentPhase.finished),
      refetchInterval: POLLING_INTERVALS.VOTING_INFO,
    },
  }) as { data: any };

  // Fetch pending voters for creator (users who haven't submitted yet)
  const { data: pendingVotersData, refetch: refetchPendingVoters } = useQuery({
    queryKey: ['/meetings', meetingId, 'pending-voters'],
    queryFn: () => getPendingVoters(meetingId),
    enabled: !!(isCreator && meeting?.currentPhase !== MeetingResponseDtoCurrentPhase.finished),
    refetchInterval: POLLING_INTERVALS.VOTING_INFO,
  });

  // Listen for socket events to refetch pending voters
  useEffect(() => {
    const handleMeetingUpdated = (event: CustomEvent) => {
      const data = event.detail;
      console.log('🔄 Meeting updated - refetching pending voters and submissions', data);

      // Refetch based on update type
      if (data?.type) {
        if (data.type === 'task_approved' || data.type === 'task_updated') {
          // Task-related updates
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId, 'all-submissions'] });
          queryClient.invalidateQueries({ queryKey: ['/tasks', 'meeting', meetingId] });
        }
        if (
          data.type === 'emotional_evaluation_updated' ||
          data.type === 'understanding_contribution_updated' ||
          data.type === 'task_planning_updated' ||
          data.type === 'task_evaluation_updated'
        ) {
          // Voting-related updates
          refetchPendingVoters();
        }
      }

      // Always refetch meeting data
      queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
    };

    const handleParticipantsUpdated = () => {
      console.log('👥 Participants updated - refetching pending voters');
      refetchPendingVoters();
    };

    const handlePhaseChanged = (event: CustomEvent) => {
      console.log('📢 Phase changed - refetching data', event.detail);
      refetchPendingVoters();
      queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
    };

    window.addEventListener('meetingUpdated', handleMeetingUpdated as EventListener);
    window.addEventListener('participants_updated', handleParticipantsUpdated);
    window.addEventListener('phaseChanged', handlePhaseChanged as EventListener);

    return () => {
      window.removeEventListener('meetingUpdated', handleMeetingUpdated as EventListener);
      window.removeEventListener('participants_updated', handleParticipantsUpdated);
      window.removeEventListener('phaseChanged', handlePhaseChanged as EventListener);
    };
  }, [meetingId, refetchPendingVoters]);

  // Combine pending voters with online status from socket participants
  const pendingVoters = useMemo(() => {
    if (!pendingVotersData?.pendingParticipants) return [];

    const onlineParticipantIds = socketParticipants?.map((p) => p.userId) || [];

    return pendingVotersData.pendingParticipants.map((participant: any) => ({
      ...participant,
      isOnline: onlineParticipantIds.includes(participant._id),
    }));
  }, [pendingVotersData, socketParticipants]);

  // Note: Join/Leave is now handled by useSocket hook via Socket.IO
  // This provides automatic cleanup on disconnect and real-time updates

  // Fetch all submissions for creator (replaces phase-submissions)
  const [phaseSubmissions, setPhaseSubmissions] = useState<any>(null);

  useEffect(() => {
    if (!isCreator || !meetingId) return;

    const fetchAllSubmissions = async () => {
      try {
        const response: any = await getAllSubmissions(meetingId);
        const data = response;

        // Validate response structure
        if (!data || typeof data !== 'object') {
          console.error('Invalid response from getAllSubmissions:', data);
          return;
        }

        // Check if submissions field exists
        if (!data.submissions) {
          console.warn(
            '⚠️ Backend response missing "submissions" field. Expected format: { meetingId, submissions: {...} }',
          );
          console.warn('Received:', data);
          // Set empty submissions to prevent errors in UI
          setPhaseSubmissions({
            emotional_evaluation: {},
            understanding_contribution: {},
            task_planning: {},
          });
          return;
        }

        setPhaseSubmissions(data.submissions);
      } catch (error: any) {
        console.error('Failed to fetch submissions:', error);

        // If 404, endpoint might not be implemented yet
        if (error?.response?.status === 404) {
          console.warn('⚠️ Endpoint /all-submissions not found. Backend needs to implement it.');
        }

        // Set empty submissions to prevent UI crashes
        setPhaseSubmissions({
          emotional_evaluation: {},
          understanding_contribution: {},
          task_planning: {},
        });
      }
    };

    fetchAllSubmissions();
    const interval = setInterval(fetchAllSubmissions, POLLING_INTERVALS.PHASE_SUBMISSIONS);
    return () => clearInterval(interval);
  }, [isCreator, meetingId]);

  // Active participants from Socket.IO (real-time)
  // Build ActiveParticipantsResponse-like structure from socket data
  const activeParticipants: ActiveParticipantsResponse | null = useMemo(() => {
    if (!socketParticipants || socketParticipants.length === 0) return null;

    return {
      meetingId: meetingId,
      activeParticipants: socketParticipants.map((p) => ({
        _id: p.userId,
        fullName: p.fullName || '',
        email: p.email || '',
        isActive: true,
        joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : new Date(p.joinedAt).toISOString(),
        lastSeen: p.lastSeen
          ? typeof p.lastSeen === 'string'
            ? p.lastSeen
            : new Date(p.lastSeen).toISOString()
          : undefined,
      })),
      totalParticipants: meeting?.participantIds?.length || 0,
      activeCount: socketParticipants.length,
    };
  }, [socketParticipants, meetingId, meeting?.participantIds]);

  // Phase 2: Emotional Evaluation state
  const [emotionalEvaluations, setEmotionalEvaluations] = useState<EmotionalEvaluationsMap>({});

  // Phase 3: Understanding & Contribution state
  const [understandingScore, setUnderstandingScore] = useState(50);
  const [contributions, setContributions] = useState<ContributionsMap>({});

  const totalContribution = useMemo(
    () =>
      Object.values(contributions).reduce(
        (sum: number, v) => sum + (typeof v === 'number' ? v : 0),
        0,
      ),
    [contributions],
  );

  // Phase 4: Task Planning state
  const [taskDescription, setTaskDescription] = useState('');
  const [commonQuestion, setCommonQuestion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expectedContribution, setExpectedContribution] = useState(50);
  const [taskEmotionalScale, setTaskEmotionalScale] = useState(50);

  // Load participant's existing task into form (if exists)
  useEffect(() => {
    if (!meeting?.taskPlannings || !currentUser?._id) {
      console.log('⚠️ Cannot load task: missing data', {
        hasTaskPlannings: !!meeting?.taskPlannings,
        hasCurrentUser: !!currentUser?._id,
      });
      return;
    }

    console.log('🔍 Looking for my task in taskPlannings:', {
      taskPlannings: meeting.taskPlannings,
      currentUserId: currentUser._id,
    });

    const myPlan = meeting.taskPlannings.find((t: any) => {
      // Handle both string comparison and populated participant object
      const planParticipantId =
        typeof t.participantId === 'string'
          ? t.participantId
          : t.participantId?._id || t.participant?._id;

      const match = planParticipantId === currentUser._id;
      console.log('Comparing:', { planParticipantId, currentUserId: currentUser._id, match });
      return match;
    });

    console.log('📋 Found my task plan:', myPlan);

    if (myPlan) {
      // Load existing task data into form
      console.log('✅ Loading task data into form:', {
        taskDescription: myPlan.taskDescription,
        commonQuestion: myPlan.commonQuestion,
        deadline: myPlan.deadline,
        contribution: myPlan.expectedContributionPercentage,
      });

      // Always set the values from the backend (even if empty) to sync state
      setTaskDescription(myPlan.taskDescription || '');
      setCommonQuestion((myPlan as any).commonQuestion || '');
      if (myPlan.deadline) {
        const date = new Date(myPlan.deadline);
        setDeadline(date.toISOString().split('T')[0]);
      }
      if (myPlan.expectedContributionPercentage !== undefined) {
        setExpectedContribution(myPlan.expectedContributionPercentage);
      }
    } else {
      console.log('❌ No task plan found for current user');
    }
  }, [meeting?.taskPlannings, meeting?.updatedAt, currentUser?._id]);

  // Phase 5: Task Evaluation state (evaluating others' tasks)
  const [taskEvaluations, setTaskEvaluations] = useState<Record<string, number>>({});
  const [isSubmittingTaskEvaluation, setIsSubmittingTaskEvaluation] = useState(false);

  // Client-side phase viewing for participants (to view/edit previous phases)
  const [viewedPhase, setViewedPhase] = useState<MeetingResponseDtoCurrentPhase | null>(null);
  const activePhase = viewedPhase || meeting?.currentPhase;

  // Mutations
  const { mutate: changePhase, isPending: isChangingPhase } = useMeetingsControllerChangePhase();
  const { mutate: submitEmotionalEvaluation, isPending: isSubmittingEmotional } =
    useMeetingsControllerSubmitEmotionalEvaluation();
  const { mutate: submitUnderstandingContribution, isPending: isSubmittingUnderstanding } =
    useMeetingsControllerSubmitUnderstandingContribution();
  const { mutate: submitTaskPlanning, isPending: isSubmittingTask } =
    useMeetingsControllerSubmitTaskPlanning();
  const { mutate: createTask, isPending: isCreatingTask } = useTasksControllerCreate();

  // Get meeting participants - USE SOCKET.IO REAL-TIME PARTICIPANTS
  // This ensures voting displays only users who are actively connected via WebSocket
  const meetingParticipants = useMemo(() => {
    if (!socketParticipants || !allUsers) {
      console.log('⚠️ No socket participants or allUsers available');
      return [];
    }

    // Get list of active participant IDs from Socket.IO
    const activeParticipantIds = socketParticipants.map((p) => p.userId);

    // Filter all users to get only those who are connected via socket
    const activeUsers = allUsers.filter((user) => activeParticipantIds.includes(user._id));

    // Ensure current user is included if they're in the socket participants list
    const currentUserId = currentUser?._id;
    const hasCurrentUser = activeUsers.some((u) => u._id === currentUserId);

    if (!hasCurrentUser && currentUserId && activeParticipantIds.includes(currentUserId)) {
      // Current user is active but not in filtered list - add them
      const currentUserData = allUsers.find((u) => u._id === currentUserId);
      if (currentUserData) {
        activeUsers.push(currentUserData);
      }
    }

    console.log(
      '📋 Socket.IO participants for voting:',
      activeUsers.map((u) => u.fullName),
    );
    console.log('🔌 Socket connected:', isSocketConnected, '| Active count:', activeUsers.length);
    return activeUsers;
  }, [socketParticipants, allUsers, currentUser, isSocketConnected]);

  // Handlers
  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  const handleNextPhase = () => {
    if (!meetingId || !meeting) return;

    const nextPhase = getNextPhase(meeting.currentPhase);
    if (!nextPhase) return;

    changePhase(
      { id: meetingId, data: { phase: nextPhase as ChangePhaseDtoPhase } },
      {
        onSuccess: (response: any) => {
          console.log('response 190192029', response);
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          if (isCreator && response.status === MeetingResponseDtoCurrentPhase.finished) {
            navigate('/meeting/create');
          }
        },
        onError: (err: any) => {
          toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось изменить фазу'}`);
        },
      },
    );
  };

  const handleChangeToPhase = (targetPhase: MeetingResponseDtoCurrentPhase) => {
    if (!meetingId || !meeting) return;

    const currentPhaseIndex = PHASE_ORDER.indexOf(meeting.currentPhase);
    const targetPhaseIndex = PHASE_ORDER.indexOf(targetPhase);

    // Creators can change the actual meeting phase
    if (isCreator) {
      changePhase(
        { id: meetingId, data: { phase: targetPhase as ChangePhaseDtoPhase } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
            toast.success(`Фаза изменена на: ${PHASE_LABELS[targetPhase]}`);
          },
          onError: (err: any) => {
            toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось изменить фазу'}`);
          },
        },
      );
    } else {
      // Participants can only view previous phases (client-side only)
      if (targetPhaseIndex >= currentPhaseIndex) {
        toast.error('Вы можете вернуться только к предыдущим этапам');
        return;
      }
      setViewedPhase(targetPhase);
      toast.success(`Просмотр этапа: ${PHASE_LABELS[targetPhase]}`);
    }
  };

  const handleReturnToCurrentPhase = () => {
    setViewedPhase(null);
    toast.success('Возврат к текущему этапу');
  };

  const handleSubmitEmotionalEvaluation = () => {
    if (!meetingId) return;

    const evaluations: ParticipantEmotionalEvaluationDto[] = Object.entries(
      emotionalEvaluations,
    ).map(([participantId, evaluation]) => ({
      targetParticipantId: participantId,
      emotionalScale: evaluation.emotionalScale,
      isToxic: evaluation.isToxic,
    }));

    if (evaluations.length === 0) {
      toast.error('Пожалуйста, оцените хотя бы одного участника');
      return;
    }

    submitEmotionalEvaluation(
      { id: meetingId, data: { evaluations } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          toast.success('Эмоциональная оценка сохранена!');
        },
        onError: (err: any) => {
          toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить оценку'}`);
        },
      },
    );
  };

  // Auto-save emotional evaluation (live update)
  const handleAutoSaveEmotionalEvaluation = () => {
    if (!meetingId) return;

    const evaluations: ParticipantEmotionalEvaluationDto[] = Object.entries(
      emotionalEvaluations,
    ).map(([participantId, evaluation]) => ({
      targetParticipantId: participantId,
      emotionalScale: evaluation.emotionalScale,
      isToxic: evaluation.isToxic,
    }));

    if (evaluations.length === 0) return;

    submitEmotionalEvaluation(
      { id: meetingId, data: { evaluations } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          // Silent save - no toast
        },
        onError: (err: any) => {
          console.error('Auto-save failed:', err);
          // Silent fail - no toast
        },
      },
    );
  };

  const handleSubmitUnderstandingContribution = () => {
    if (!meetingId) return;

    const contributionList: ContributionInfluenceDto[] = Object.entries(contributions).map(
      ([participantId, percentage]) => ({
        participantId,
        contributionPercentage: Number(percentage),
      }),
    );

    if (contributionList.length === 0) {
      toast.error('Пожалуйста, распределите вклад участников');
      return;
    }

    const total = contributionList.reduce((sum, c) => sum + c.contributionPercentage, 0);
    if (Math.abs(total - 100) > 0.1) {
      toast.error(`Общий вклад должен быть равен 100%. Сейчас: ${total.toFixed(1)}%`);
      return;
    }

    submitUnderstandingContribution(
      { id: meetingId, data: { understandingScore, contributions: contributionList } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          toast.success('Понимание и вклад сохранены!');
        },
        onError: (err: any) => {
          toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить данные'}`);
        },
      },
    );
  };

  // Auto-save understanding & contribution (live update)
  const handleAutoSaveUnderstandingContribution = () => {
    if (!meetingId) return;

    const contributionList: ContributionInfluenceDto[] = Object.entries(contributions).map(
      ([participantId, percentage]) => ({
        participantId,
        contributionPercentage: Number(percentage),
      }),
    );

    // if (contributionList.length === 0) return;

    const total = contributionList.reduce((sum, c) => sum + c.contributionPercentage, 0);
    // if (Math.abs(total - 100) > 0.1) {
    //   // Don't auto-save if total is invalid
    //   return;
    // }

    submitUnderstandingContribution(
      { id: meetingId, data: { understandingScore, contributions: contributionList } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          // Silent save - no toast
        },
        onError: (err: any) => {
          console.error('Auto-save failed:', err);
          // Silent fail - no toast
        },
      },
    );
  };

  const handleSubmitTaskPlanning = () => {
    if (!meetingId || !taskDescription || !deadline) {
      toast.error('Заполните описание задачи и дедлайн');
      return;
    }

    const deadlineISO = new Date(deadline).toISOString();

    submitTaskPlanning(
      {
        id: meetingId,
        data: {
          taskDescription,
          commonQuestion,
          deadline: deadlineISO,
          expectedContributionPercentage: expectedContribution,
        },
      },
      {
        onSuccess: () => {
          createTask(
            {
              data: {
                commonQuestion,
                description: taskDescription,
                meetingId,
                deadline: deadlineISO,
                contributionImportance: expectedContribution,
              },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
                queryClient.invalidateQueries({ queryKey: ['/tasks'] });
                toast.success('Задача создана и добавлена в ваш список!');
                // DON'T clear fields - participant should see their submitted task
                // Fields will stay populated so user can see what they submitted
                // If they need to edit, they can modify and resubmit
              },
              onError: (taskErr: any) => {
                console.error('Task creation failed:', taskErr);
                toast.error(
                  `План сохранен, но задача не создана: ${
                    taskErr?.response?.data?.message || 'Ошибка'
                  }`,
                );
              },
            },
          );
        },
        onError: (err: any) => {
          toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить план'}`);
        },
      },
    );
  };

  // Auto-save task emotional scale
  const handleAutoSaveTaskEmotionalScale = () => {
    // This could be extended to save to backend if needed
    // For now, it's just stored in local state
    console.log('Task emotional scale auto-saved:', taskEmotionalScale);
  };

  const handleSubmitTaskEvaluation = async (evaluations: Record<string, number>) => {
    if (!meetingId) return;

    const evaluationList: TaskImportanceEvaluationItem[] = Object.entries(evaluations).map(
      ([authorId, score]) => ({
        taskAuthorId: authorId,
        importanceScore: score,
      }),
    );

    if (evaluationList.length === 0) {
      toast.error('Нет задач для оценки');
      return;
    }

    setIsSubmittingTaskEvaluation(true);

    try {
      await submitTaskEvaluation(meetingId, { evaluations: evaluationList });
      queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
      toast.success('Оценки важности задач сохранены!');
      setTaskEvaluations(evaluations);
    } catch (err: any) {
      console.error('Task evaluation submission failed:', err);
      toast.error(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить оценки'}`);
    } finally {
      setIsSubmittingTaskEvaluation(false);
    }
  };

  const { mutate: approveTask, isPending: isApprovingTask } = useMutation({
    mutationFn: async ({
      taskId,
      currentApproved,
    }: {
      taskId: string;
      currentApproved: boolean;
    }) => {
      // PATCH /tasks/:id/approve
      // Request body: { approved: boolean }
      // Toggle the current approval status
      const response = await customInstance<any>({
        url: `/tasks/${taskId}/approve`,
        method: 'PATCH',
        data: { approved: !currentApproved }, // Toggle the current status
      });
      return response;
    },
    onSuccess: (data) => {
      const approved = data?.approved || data?.task?.approved;
      toast.success(approved ? 'Задача одобрена' : 'Одобрение отменено');
      // Refetch all relevant data
      queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId, 'all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['/tasks', 'meeting', meetingId] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Не удалось обновить статус задачи';
      toast.error(message);
      console.error('Task approval error:', err);
    },
  });

  const isMyTaskApproved = useMemo(() => {
    if (!meeting?.taskPlannings || !currentUser?._id) return false;

    // Find current user's task planning
    const myPlan = meeting.taskPlannings.find((t: any) => t.participant._id === currentUser._id);
    if (!myPlan) return false;

    return (myPlan as any)?.approved === true;
  }, [meeting, currentUser]);

  const handleApproveTask = (taskId: string, currentApproved: boolean) => {
    approveTask({ taskId, currentApproved });
  };

  return {
    // Data
    meeting,
    meetingId: meeting?._id,
    statistics,
    allUsers,
    meetingParticipants,
    votingInfo,
    phaseSubmissions,
    activeParticipants,
    pendingVoters,

    // State
    isLoading,
    isCreator,
    activePhase,
    viewedPhase,

    // Phase 2 state
    emotionalEvaluations,
    setEmotionalEvaluations,

    // Phase 3 state
    understandingScore,
    setUnderstandingScore,
    contributions,
    setContributions,
    totalContribution,

    // Phase 4 state
    taskDescription,
    setTaskDescription,
    commonQuestion,
    setCommonQuestion,
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,
    taskEmotionalScale,
    setTaskEmotionalScale,
    handleAutoSaveTaskEmotionalScale,
    isMyTaskApproved,
    handleApproveTask,
    isApprovingTask,

    // Phase 5 state
    taskEvaluations,
    setTaskEvaluations,

    // Mutations
    isSubmittingEmotional,
    isSubmittingUnderstanding,
    isSubmittingTask,
    isSubmittingTaskEvaluation,
    isCreatingTask,
    isChangingPhase,

    // Handlers
    handleNextPhase,
    handleChangeToPhase,
    handleReturnToCurrentPhase,
    handleSubmitEmotionalEvaluation,
    handleAutoSaveEmotionalEvaluation,
    handleSubmitUnderstandingContribution,
    handleAutoSaveUnderstandingContribution,
    handleSubmitTaskPlanning,
    handleSubmitTaskEvaluation,
    handleNavigateBack,
  };
};
