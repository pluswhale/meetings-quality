/**
 * ViewModel for CreateMeeting
 * Contains all business logic for creating meetings
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/src/app/providers/QueryProvider';
import { useMeetingsControllerCreate } from '@/src/shared/api/generated/meetings/meetings';
import { CreateMeetingViewModel } from './types';

export const useCreateMeetingViewModel = (): CreateMeetingViewModel => {
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  // API mutation
  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !question) {
      setError('Заполните все поля');
      return;
    }

    createMeeting(
      { data: { title, question, participantIds: [] } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          navigate(`/meeting/${data._id}`);
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || 'Ошибка создания встречи';
          setError(message);
        },
      }
    );
  };

  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  return {
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
