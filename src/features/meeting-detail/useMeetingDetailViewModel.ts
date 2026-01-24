/**
 * ViewModel for MeetingDetail
 * Contains all business logic, state management, and data fetching
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { POLLING_INTERVALS } from '@/src/shared/constants';
import { isUserCreator, getNextPhase } from './lib';
import { 
  MeetingDetailViewModel, 
  EmotionalEvaluationsMap, 
  ContributionsMap 
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'https://meetings-quality-backend-production.up.railway.app';

export const useMeetingDetailViewModel = (meetingId: string): MeetingDetailViewModel => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

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
  const isCreator = useMemo(
    () => isUserCreator(meeting, currentUser?._id),
    [meeting, currentUser]
  );

  // Fetch voting info for creator
  const { data: votingInfo } = useMeetingsControllerGetVotingInfo(meetingId, {
    query: {
      enabled: !!(
        isCreator && meeting?.currentPhase !== MeetingResponseDtoCurrentPhase.finished
      ),
      refetchInterval: POLLING_INTERVALS.VOTING_INFO,
    },
  }) as { data: any };

  // Fetch phase submissions for creator
  const [phaseSubmissions, setPhaseSubmissions] = useState<any>(null);

  useEffect(() => {
    if (!isCreator || !meetingId) return;

    const fetchPhaseSubmissions = async () => {
      try {
        const response = await fetch(`${API_URL}/meetings/${meetingId}/phase-submissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPhaseSubmissions(data);
        }
      } catch (error) {
        console.error('Failed to fetch phase submissions:', error);
      }
    };

    fetchPhaseSubmissions();
    const interval = setInterval(fetchPhaseSubmissions, POLLING_INTERVALS.PHASE_SUBMISSIONS);
    return () => clearInterval(interval);
  }, [isCreator, meetingId]);

  // Phase 2: Emotional Evaluation state
  const [emotionalEvaluations, setEmotionalEvaluations] = useState<EmotionalEvaluationsMap>({});

  // Phase 3: Understanding & Contribution state
  const [understandingScore, setUnderstandingScore] = useState(50);
  const [contributions, setContributions] = useState<ContributionsMap>({});

  const totalContribution = useMemo(
    () =>
      Object.values(contributions).reduce(
        (sum: number, v) => sum + (typeof v === 'number' ? v : 0),
        0
      ),
    [contributions]
  );

  // Phase 4: Task Planning state
  const [taskDescription, setTaskDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expectedContribution, setExpectedContribution] = useState(50);

  // Mutations
  const { mutate: changePhase, isPending: isChangingPhase } =
    useMeetingsControllerChangePhase();
  const { mutate: submitEmotionalEvaluation, isPending: isSubmittingEmotional } =
    useMeetingsControllerSubmitEmotionalEvaluation();
  const { mutate: submitUnderstandingContribution, isPending: isSubmittingUnderstanding } =
    useMeetingsControllerSubmitUnderstandingContribution();
  const { mutate: submitTaskPlanning, isPending: isSubmittingTask } =
    useMeetingsControllerSubmitTaskPlanning();
  const { mutate: createTask, isPending: isCreatingTask } = useTasksControllerCreate();

  // Get meeting participants
  const meetingParticipants = useMemo(() => {
    if (!meeting || !allUsers) return [];

    const participantIds: string[] = Array.isArray(meeting.participantIds)
      ? meeting.participantIds.map((p: any) => (typeof p === 'string' ? p : p._id))
      : [];

    return allUsers.filter((user) => participantIds.includes(user._id));
  }, [meeting, allUsers]);

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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось изменить фазу'}`);
        },
      }
    );
  };

  const handleSubmitEmotionalEvaluation = () => {
    if (!meetingId) return;

    const evaluations: ParticipantEmotionalEvaluationDto[] = Object.entries(
      emotionalEvaluations
    ).map(([participantId, evaluation]) => ({
      targetParticipantId: participantId,
      emotionalScale: evaluation.emotionalScale,
      isToxic: evaluation.isToxic,
    }));

    if (evaluations.length === 0) {
      alert('Пожалуйста, оцените хотя бы одного участника');
      return;
    }

    submitEmotionalEvaluation(
      { id: meetingId, data: { evaluations } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          alert('✅ Эмоциональная оценка сохранена!');
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить оценку'}`);
        },
      }
    );
  };

  const handleSubmitUnderstandingContribution = () => {
    if (!meetingId) return;

    const contributionList: ContributionInfluenceDto[] = Object.entries(contributions).map(
      ([participantId, percentage]) => ({
        participantId,
        contributionPercentage: Number(percentage),
      })
    );

    if (contributionList.length === 0) {
      alert('Пожалуйста, распределите вклад участников');
      return;
    }

    const total = contributionList.reduce((sum, c) => sum + c.contributionPercentage, 0);
    if (Math.abs(total - 100) > 0.1) {
      alert(`Общий вклад должен быть равен 100%. Сейчас: ${total.toFixed(1)}%`);
      return;
    }

    submitUnderstandingContribution(
      { id: meetingId, data: { understandingScore, contributions: contributionList } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/meetings', meetingId] });
          alert('✅ Понимание и вклад сохранены!');
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить данные'}`);
        },
      }
    );
  };

  const handleSubmitTaskPlanning = () => {
    if (!meetingId || !taskDescription || !deadline) {
      alert('Заполните описание задачи и дедлайн');
      return;
    }

    const deadlineISO = new Date(deadline).toISOString();

    submitTaskPlanning(
      {
        id: meetingId,
        data: {
          taskDescription,
          deadline: deadlineISO,
          expectedContributionPercentage: expectedContribution,
        },
      },
      {
        onSuccess: () => {
          createTask(
            {
              data: {
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
                alert('✅ Задача создана и добавлена в ваш список!');
                setTaskDescription('');
                setDeadline('');
                setExpectedContribution(50);
              },
              onError: (taskErr: any) => {
                console.error('Task creation failed:', taskErr);
                alert(
                  `⚠️ План сохранен, но задача не создана: ${
                    taskErr?.response?.data?.message || 'Ошибка'
                  }`
                );
              },
            }
          );
        },
        onError: (err: any) => {
          alert(`Ошибка: ${err?.response?.data?.message || 'Не удалось сохранить план'}`);
        },
      }
    );
  };

  return {
    // Data
    meeting,
    statistics,
    allUsers,
    meetingParticipants,
    votingInfo,
    phaseSubmissions,

    // State
    isLoading,
    isCreator,

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
    deadline,
    setDeadline,
    expectedContribution,
    setExpectedContribution,

    // Mutations
    isSubmittingEmotional,
    isSubmittingUnderstanding,
    isSubmittingTask,
    isCreatingTask,
    isChangingPhase,

    // Handlers
    handleNextPhase,
    handleSubmitEmotionalEvaluation,
    handleSubmitUnderstandingContribution,
    handleSubmitTaskPlanning,
    handleNavigateBack,
  };
};
