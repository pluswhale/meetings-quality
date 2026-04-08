import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMeetingsControllerCreate } from '@/src/shared/api/generated/meetings/meetings';
import { getMeetingsControllerFindAllQueryKey } from '@/src/shared/api/generated/meetings/meetings';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { CreateMeetingViewModel, ParticipantOption } from './types';

export const useCreateMeetingViewModel = (): CreateMeetingViewModel => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuthStore();

  const projectId = searchParams.get('projectId') ?? undefined;

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [upcomingDate, setUpcomingDate] = useState<string | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');

  const { data: rawUsers = [] } = useUsersControllerFindAll();

  // Exclude the creator from the list — they're always added by the backend.
  const allUsers = useMemo<ParticipantOption[]>(
    () =>
      (rawUsers as Array<{ _id: string; fullName: string; email: string }>)
        .filter((u) => u._id !== currentUser?._id)
        .map((u) => ({ _id: u._id, fullName: u.fullName, email: u.email })),
    [rawUsers, currentUser?._id],
  );

  const toggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !question) {
      setError('Заполните все поля');
      return;
    }

    createMeeting(
      { data: { title, question, participantIds: selectedParticipantIds, upcomingDate, projectId } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getMeetingsControllerFindAllQueryKey() });
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
    allUsers,
    selectedParticipantIds,
    toggleParticipant,
    participantSearch,
    setParticipantSearch,
    isPending,
    handleSubmit,
    handleNavigateBack,
  };
};
