/**
 * CreateMeetingView - Pure presentation layer for creating meetings
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Input, TextArea, Heading, Text, DateTimePicker } from '@/src/shared/ui';
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

      <motion.div
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
      </motion.div>

      {vm.isLinkedMeeting && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          <Text variant="small" className="text-blue-700">
            Связанная встреча — фаза 0 будет включать ретроспективу предыдущей встречи.
          </Text>
        </motion.div>
      )}

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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Text variant="body" color="muted" className="text-lg italic mb-2">
            Дата и время начала встречи
          </Text>

          <DateTimePicker
            selected={vm.upcomingDate ? new Date(vm.upcomingDate) : null}
            onChange={(date: Date | null) => {
              if (date) {
                vm.setUpcomingDate(date.toISOString());
              }
            }}
            minDate={new Date()}
            placeholder="Выберите дату и время"
            disabled={vm.isPending}
          />
        </motion.div>

        {/* Participant selector */}
        {vm.allUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-3"
          >
            <Text variant="body" color="muted" className="text-lg italic mb-1">
              Участники встречи
            </Text>

            <Input
              type="text"
              placeholder="Поиск по имени или email…"
              value={vm.participantSearch}
              onChange={(e) => vm.setParticipantSearch(e.target.value)}
              fullWidth
              disabled={vm.isPending}
            />

            <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {vm.allUsers
                .filter(
                  (u) =>
                    !vm.participantSearch ||
                    u.fullName.toLowerCase().includes(vm.participantSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(vm.participantSearch.toLowerCase()),
                )
                .map((user) => {
                  const checked = vm.selectedParticipantIds.includes(user._id);
                  return (
                    <label
                      key={user._id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${checked ? 'bg-blue-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => vm.toggleParticipant(user._id)}
                        className="w-4 h-4 rounded accent-blue-600"
                        disabled={vm.isPending}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      {checked && (
                        <span className="ml-auto text-xs font-medium text-blue-600">✓</span>
                      )}
                    </label>
                  );
                })}
            </div>

            {vm.selectedParticipantIds.length > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                Выбрано: {vm.selectedParticipantIds.length} участник(ов)
              </p>
            )}
          </motion.div>
        )}

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
