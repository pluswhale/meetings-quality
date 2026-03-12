import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMeetingsControllerCreate } from '@/src/shared/api/generated/meetings/meetings';
import { getMeetingsControllerFindAllQueryKey } from '@/src/shared/api/generated/meetings/meetings';
import { CreateMeetingViewModel } from './types';

export const useCreateMeetingViewModel = (): CreateMeetingViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Read optional projectId from URL: /meeting/create?projectId=xxx
  const projectId = searchParams.get('projectId') ?? undefined;

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [upcomingDate, setUpcomingDate] = useState<string | null>(null);

  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !question) {
      setError('Заполните все поля');
      return;
    }

    createMeeting(
      { data: { title, question, participantIds: [], upcomingDate, projectId } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getMeetingsControllerFindAllQueryKey() });
          // If came from a project, go back to the project page; otherwise go to the meeting
          if (projectId) {
            navigate(`/project/${projectId}?tab=meetings`);
          } else {
            navigate(`/meeting/${data._id}`);
          }
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Ошибка создания встречи';
          setError(message);
        },
      },
    );
  };

  const handleNavigateBack = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return {
    upcomingDate,
    setUpcomingDate,
    title,
    setTitle,
    question,
    setQuestion,
    error,
    isPending,
    handleSubmit,
    handleNavigateBack,
  };
};
