/**
 * CreateMeetingView - Pure presentation layer for creating meetings
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Input, TextArea, Heading, Text } from '@/src/shared/ui';
import { useCreateMeetingViewModel } from './useCreateMeetingViewModel';

export const CreateMeetingView: React.FC = () => {
  const vm = useCreateMeetingViewModel();

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
          onClick={vm.handleNavigateBack}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
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

      {vm.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
        >
          <Text variant="small" className="text-red-600">
            {vm.error}
          </Text>
        </motion.div>
      )}

      <motion.form
        onSubmit={vm.handleSubmit}
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
            value={vm.title}
            onChange={(e) => vm.setTitle(e.target.value)}
            required
            fullWidth
            inputSize="lg"
            disabled={vm.isPending}
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
            value={vm.question}
            onChange={(e) => vm.setQuestion(e.target.value)}
            required
            fullWidth
            disabled={vm.isPending}
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
            disabled={vm.isPending}
          >
            {vm.isPending ? 'Создание...' : 'Запустить процесс'}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};
