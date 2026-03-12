import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTasksControllerCreate } from '@/src/shared/api/generated/tasks/tasks';
import { useMeetingsControllerFindAll } from '@/src/shared/api/generated/meetings/meetings';
import {
  getTasksControllerFindAllQueryKey,
  getProjectsControllerFindOneQueryKey,
} from './queryKeys';
import type { MeetingResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

export interface CreateTaskViewModel {
  // Context
  projectId: string | undefined;

  // Meeting selector
  meetings: MeetingResponseDto[];
  meetingsLoading: boolean;
  selectedMeetingId: string;
  setSelectedMeetingId: (id: string) => void;

  // Form state
  description: string;
  setDescription: (v: string) => void;
  commonQuestion: string;
  setCommonQuestion: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  estimateHours: string;
  setEstimateHours: (v: string) => void;
  contributionImportance: string;
  setContributionImportance: (v: string) => void;

  isSubmitting: boolean;
  handleSubmit: () => void;
  handleNavigateBack: () => void;
}

export const useCreateTaskViewModel = (): CreateTaskViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('projectId') ?? undefined;

  // Load meetings scoped to this project so user can pick one
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetingsControllerFindAll(
    projectId ? { projectId } : undefined,
    { query: { enabled: true } },
  );

  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [description, setDescription] = useState('');
  const [commonQuestion, setCommonQuestion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [contributionImportance, setContributionImportance] = useState('');

  const { mutate: createTask, isPending: isSubmitting } = useTasksControllerCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getTasksControllerFindAllQueryKey(projectId) });
        if (projectId) {
          queryClient.invalidateQueries({
            queryKey: getProjectsControllerFindOneQueryKey(projectId),
          });
        }
        toast.success('Задача создана');
        if (projectId) {
          navigate(`/project/${projectId}?tab=tasks`);
        } else {
          navigate('/dashboard');
        }
      },
      onError: () => {
        toast.error('Не удалось создать задачу');
      },
    },
  });

  const handleSubmit = () => {
    if (!selectedMeetingId) {
      toast.error('Выберите встречу');
      return;
    }
    if (!description.trim()) {
      toast.error('Введите описание задачи');
      return;
    }
    if (!commonQuestion.trim()) {
      toast.error('Введите общий вопрос');
      return;
    }
    if (!deadline) {
      toast.error('Выберите дедлайн');
      return;
    }

    const hours = Number(estimateHours);
    const importance = Number(contributionImportance);

    if (!estimateHours || isNaN(hours) || hours <= 0) {
      toast.error('Укажите оценку времени (часы)');
      return;
    }
    if (
      !contributionImportance ||
      isNaN(importance) ||
      importance < 0 ||
      importance > 100
    ) {
      toast.error('Вклад должен быть от 0 до 100');
      return;
    }

    createTask({
      data: {
        projectId,
        meetingId: selectedMeetingId,
        description: description.trim(),
        commonQuestion: commonQuestion.trim(),
        deadline: new Date(deadline).toISOString(),
        estimateHours: hours,
        contributionImportance: importance,
      },
    });
  };

  const handleNavigateBack = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return {
    projectId,
    meetings,
    meetingsLoading,
    selectedMeetingId,
    setSelectedMeetingId,
    description,
    setDescription,
    commonQuestion,
    setCommonQuestion,
    deadline,
    setDeadline,
    estimateHours,
    setEstimateHours,
    contributionImportance,
    setContributionImportance,
    isSubmitting,
    handleSubmit,
    handleNavigateBack,
  };
};
