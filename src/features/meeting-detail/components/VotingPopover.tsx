/**
 * VotingPopover - Shows all participant submissions across all phases for creator
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';

interface SubmissionData {
  emotional_evaluation?: Record<string, any>;
  understanding_contribution?: Record<string, any>;
  task_planning?: Record<string, any>;
}

interface VotingPopoverProps {
  submissions: SubmissionData | null;
  participants: UserResponseDto[];
  isLoading?: boolean;
}

export const VotingPopover: React.FC<VotingPopoverProps> = ({
  submissions,
  participants,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'emotional' | 'understanding' | 'tasks'>('emotional');

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-slate-200">
          <div className="animate-pulse text-slate-400">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-2xl px-6 py-3 font-black shadow-2xl hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        Голоса
        {isOpen ? '▼' : '▲'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 w-[600px] max-h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('emotional')}
                className={`flex-1 py-4 px-4 font-black text-sm transition-colors ${
                  activeTab === 'emotional'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Эмоции
              </button>
              <button
                onClick={() => setActiveTab('understanding')}
                className={`flex-1 py-4 px-4 font-black text-sm transition-colors ${
                  activeTab === 'understanding'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Понимание
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-4 px-4 font-black text-sm transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Задачи
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[500px] p-6">
              {activeTab === 'emotional' && (
                <EmotionalTab submissions={submissions?.emotional_evaluation} participants={participants} />
              )}
              {activeTab === 'understanding' && (
                <UnderstandingTab submissions={submissions?.understanding_contribution} participants={participants} />
              )}
              {activeTab === 'tasks' && (
                <TasksTab submissions={submissions?.task_planning} participants={participants} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmotionalTab: React.FC<{ submissions?: Record<string, any>; participants: UserResponseDto[] }> = ({
  submissions,
  participants,
}) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет оценок эмоций" />;
  }

  return (
    <div className="space-y-4">
      {Object.entries(submissions).map(([userId, data]) => {
        // Use participant info from submission data (more reliable)
        const participantName = data.participant?.fullName || 
                               participants.find((p) => p._id === userId)?.fullName || 
                               'Unknown';
        
        return (
          <div key={userId} className="bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-black text-slate-900">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-1">{data.participant.email}</p>
                )}
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
              </span>
            </div>
            
            {data.submitted && data.evaluations && data.evaluations.length > 0 ? (
              <div className="space-y-1 mt-3 pt-3 border-t border-slate-200">
                {data.evaluations.map((evaluation: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="text-slate-600">{evaluation.targetParticipant?.fullName || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${evaluation.emotionalScale >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {evaluation.emotionalScale > 0 ? '+' : ''}{evaluation.emotionalScale}
                        </span>
                        {evaluation.isToxic && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                            Токсичен
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : data.submitted ? (
              <p className="text-xs text-slate-400 mt-2 italic">Оценок не найдено</p>
            ) : (
              <p className="text-xs text-slate-400 mt-2 italic">Ожидание ответа...</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const UnderstandingTab: React.FC<{ submissions?: Record<string, any>; participants: UserResponseDto[] }> = ({
  submissions,
  participants,
}) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет оценок понимания" />;
  }

  return (
    <div className="space-y-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName = data.participant?.fullName || 
                               participants.find((p) => p._id === userId)?.fullName || 
                               'Unknown';
        
        return (
          <div key={userId} className="bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <span className="font-black text-slate-900">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-1">{data.participant.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {data.submitted && data.understandingScore !== undefined && (
                  <span className="text-2xl font-black text-green-600">{data.understandingScore}%</span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
                </span>
              </div>
            </div>
            
            {data.submitted && data.contributions && data.contributions.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-xs font-black text-slate-400 mb-2">Вклад участников:</div>
                {data.contributions.map((contrib: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="text-slate-600">{contrib.participant?.fullName || 'Unknown'}</span>
                      <span className="font-bold text-blue-600">{contrib.contributionPercentage}%</span>
                    </div>
                  );
                })}
              </div>
            ) : data.submitted ? (
              <p className="text-xs text-slate-400 mt-2 italic">Вклад не указан</p>
            ) : (
              <p className="text-xs text-slate-400 mt-2 italic">Ожидание ответа...</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TasksTab: React.FC<{ submissions?: Record<string, any>; participants: UserResponseDto[] }> = ({
  submissions,
  participants,
}) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет созданных задач" />;
  }

  return (
    <div className="space-y-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName = data.participant?.fullName || 
                               participants.find((p) => p._id === userId)?.fullName || 
                               'Unknown';
        
        return (
          <div key={userId} className="bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-black text-slate-900">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-1">{data.participant.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {data.submitted && data.expectedContributionPercentage !== undefined && (
                  <span className="text-xl font-black text-purple-600">{data.expectedContributionPercentage}%</span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
                </span>
              </div>
            </div>
            
            {data.submitted && data.taskDescription ? (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                <p className="text-sm text-slate-700 font-medium">{data.taskDescription}</p>
                {data.deadline && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Дедлайн: {new Date(data.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            ) : data.submitted ? (
              <p className="text-xs text-slate-400 mt-2 italic">Задача не описана</p>
            ) : (
              <p className="text-xs text-slate-400 mt-2 italic">Ожидание ответа...</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 text-slate-400">
    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="font-bold">{message}</p>
  </div>
);
