
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, TextArea, Heading, Text } from '../components/ui';
import { queryClient } from '../src/providers/QueryProvider';
import { useMeetingsControllerCreate } from '@/src/api/generated/meetings/meetings';

export const CreateMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (title && question) {
      createMeeting(
        { data: { title, question, participantIds: [] } },
        {
          onSuccess: (data) => {
            // Invalidate meetings query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            navigate(`/meeting/${data._id}`);
          },
          onError: (err: any) => {
            const message = err?.response?.data?.message || 'Ошибка создания встречи';
            setError(message);
          },
        }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 md:p-12"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
          className="mb-10"
        >
          Назад к списку
        </Button>
      </motion.div>
      
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Heading level="h1" className="mb-4">
          Новая встреча
        </Heading>
        <Text variant="body" color="muted" className="text-lg italic">
          Сформулируйте повестку для достижения максимальной прозрачности.
        </Text>
      </motion.header>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
        >
          <Text variant="small" className="text-red-600">{error}</Text>
        </motion.div>
      )}
      
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Input
            type="text"
            label="Тема совещания"
            placeholder="Напр., Стратегия развития Q3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            inputSize="lg"
            disabled={isPending}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TextArea
            label="Главный вопрос"
            placeholder="Какой основной результат мы должны получить по итогам обсуждения?"
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            fullWidth
            disabled={isPending}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            className="uppercase tracking-[0.2em]"
            disabled={isPending}
          >
            {isPending ? 'Создание...' : 'Запустить процесс'}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};
