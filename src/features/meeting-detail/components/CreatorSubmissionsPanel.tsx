/**
 * CreatorSubmissionsPanel - Main panel for creators to view submissions and active participants
 */

import React, { useState } from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { ActiveParticipantsResponse } from '../api/meeting-room.api';

interface SubmissionData {
  emotional_evaluation?: Record<string, any>;
  understanding_contribution?: Record<string, any>;
  task_planning?: Record<string, any>;
}

interface CreatorSubmissionsPanelProps {
  submissions: SubmissionData | null;
  participants: UserResponseDto[];
  isLoading?: boolean;
  isApprovingTask?: boolean;
  onApproveTask?: (taskId: string, currentStatus: boolean) => void;
}

export const CreatorSubmissionsPanel: React.FC<CreatorSubmissionsPanelProps> = ({
  submissions,
  participants,
  isLoading = false,
  isApprovingTask = false,
  onApproveTask = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'emotional' | 'understanding' | 'tasks'>('emotional');

  return (
    <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8 md:mb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-8">
        <div className="flex items-center gap-2 md:gap-3">
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-white truncate">
              Панель администратора
            </h2>
            <p className="text-blue-100 text-xs md:text-sm font-bold mt-0.5 md:mt-1 truncate">
              Отслеживание участников и голосов
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
        <button
          onClick={() => setActiveTab('emotional')}
          className={`flex-1 min-w-[80px] py-3 md:py-4 px-3 md:px-6 font-black text-xs md:text-sm transition-colors ${
            activeTab === 'emotional'
              ? 'bg-white text-blue-600 border-b-4 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Эмоции
        </button>
        <button
          onClick={() => setActiveTab('understanding')}
          className={`flex-1 min-w-[80px] py-3 md:py-4 px-3 md:px-6 font-black text-xs md:text-sm transition-colors ${
            activeTab === 'understanding'
              ? 'bg-white text-blue-600 border-b-4 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Понимание
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 min-w-[80px] py-3 md:py-4 px-3 md:px-6 font-black text-xs md:text-sm transition-colors ${
            activeTab === 'tasks'
              ? 'bg-white text-blue-600 border-b-4 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Задачи
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        {isLoading ? (
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin w-6 h-6 md:w-8 md:h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3 md:mb-4" />
            <p className="text-slate-400 font-bold text-sm md:text-base">Загрузка...</p>
          </div>
        ) : (
          <>
            {activeTab === 'emotional' && (
              <EmotionalTab
                submissions={submissions?.emotional_evaluation}
                participants={participants}
              />
            )}
            {activeTab === 'understanding' && (
              <UnderstandingTab
                submissions={submissions?.understanding_contribution}
                participants={participants}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksTab
                isApproving={isApprovingTask}
                onApprove={onApproveTask}
                submissions={submissions?.task_planning}
                participants={participants}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EmotionalTab: React.FC<{
  submissions?: Record<string, any>;
  participants: UserResponseDto[];
}> = ({ submissions, participants }) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет оценок эмоций" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName =
          data.participant?.fullName ||
          participants.find((p) => p._id === userId)?.fullName ||
          'Unknown';

        return (
          <div
            key={userId}
            className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200"
          >
            <div className="flex items-start md:items-center justify-between mb-3 md:mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-400 font-medium text-[11px] md:text-[11px]">
                  Отправитель:
                </span>
                <span className="font-black text-slate-900 text-base md:text-lg block truncate">
                  {participantName}
                </span>
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                  data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {data.submitted ? '✓' : '○'}
                <span className="hidden sm:inline ml-1">
                  {data.submitted ? 'Отправлено' : 'Не отправлено'}
                </span>
              </span>
            </div>

            {data.submitted && data.evaluations && data.evaluations.length > 0 ? (
              <div className="space-y-1.5 md:space-y-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                {data.evaluations.map((evaluation: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center py-1 md:py-2 gap-2">
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">
                        {evaluation.targetParticipant?.fullName || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        <span
                          className={`font-black text-base md:text-lg ${evaluation.emotionalScale >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {evaluation.emotionalScale > 0 ? '+' : ''}
                          {evaluation.emotionalScale}
                        </span>
                        {evaluation.isToxic && (
                          <span className="text-[10px] md:text-xs bg-red-100 text-red-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold whitespace-nowrap">
                            Токсичен
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : data.submitted ? (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Оценок не найдено
              </p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Ожидание ответа...
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const UnderstandingTab: React.FC<{
  submissions?: Record<string, any>;
  participants: UserResponseDto[];
}> = ({ submissions, participants }) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет оценок понимания" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName =
          data.participant?.fullName ||
          participants.find((p) => p._id === userId)?.fullName ||
          'Unknown';

        return (
          <div key={userId} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <span className="font-black text-slate-900 text-lg">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-1">{data.participant.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {data.submitted && data.understandingScore !== undefined && (
                  <span className="text-3xl font-black text-green-600">
                    {data.understandingScore}%
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
                </span>
              </div>
            </div>

            {data.submitted && data.contributions && data.contributions.length > 0 ? (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                <div className="text-[10px] md:text-xs font-black text-slate-400 mb-2 md:mb-3">
                  Вклад участников:
                </div>
                {data.contributions.map((contrib: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center py-1 md:py-2 gap-2">
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">
                        {contrib.participant?.fullName || 'Unknown'}
                      </span>
                      <span className="font-black text-base md:text-lg text-blue-600 flex-shrink-0">
                        {contrib.contributionPercentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : data.submitted ? (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Вклад не указан
              </p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Ожидание ответа...
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TasksTab: React.FC<{
  submissions?: Record<string, any>;
  participants: UserResponseDto[];
  onApprove: (taskId: string, currentStatus: boolean) => void;
  isApproving?: boolean;
}> = ({ submissions, participants, onApprove, isApproving = false }) => {
  if (!submissions || Object.keys(submissions).length === 0) {
    return <EmptyState message="Нет созданных задач" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName =
          data.participant?.fullName ||
          participants.find((p) => p._id === userId)?.fullName ||
          'Unknown';

        console.log('data', data);

        const isApproved =
          data.approved === true || data.isApproved === true || data.task?.approved === true;
        const taskId = data.taskId;

        return (
          <div
            key={userId}
            className={`relative p-6 rounded-2xl border transition-all duration-300 ${
              isApproved
                ? 'bg-green-50/50 border-green-300 shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Status Indicator Stripe for Approved Tasks */}
            {isApproved && (
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-green-400 rounded-r-full" />
            )}

            <div className="flex items-center justify-between mb-4 pl-2">
              <div className="min-w-0 flex-1 mr-2">
                <span
                  className={`font-black text-lg block truncate ${isApproved ? 'text-green-900' : 'text-slate-900'}`}
                >
                  {participantName}
                </span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{data.participant.email}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* APPROVAL CHECKBOX LOGIC */}
                {taskId && !isApproved && (
                  <label
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none ${
                      isApproved
                        ? 'bg-white border-green-200 hover:border-green-300'
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isApproved}
                        disabled={isApproving}
                        onChange={() => onApprove(taskId, isApproved)}
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded checked:bg-green-500 checked:border-green-500 transition-colors cursor-pointer disabled:opacity-50"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white pointer-events-none hidden peer-checked:block left-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-black ${
                        isApproved ? 'text-green-600' : 'text-slate-400'
                      }`}
                    >
                      {isApproved ? 'Одобрено' : 'Одобрить'}
                    </span>
                  </label>
                )}

                {/* Contribution Score */}
                {data.submitted && data.expectedContributionPercentage !== undefined && (
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-purple-600 leading-none">
                      {data.expectedContributionPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Task Content */}
            <div className="pl-2">
              {data.submitted && data.taskDescription ? (
                <div
                  className={`mt-3 pt-3 border-t space-y-2 ${isApproved ? 'border-green-100' : 'border-slate-200'}`}
                >
                  <p
                    className={`font-medium text-sm md:text-base ${isApproved ? 'text-green-900' : 'text-slate-700'}`}
                  >
                    {data.taskDescription}
                  </p>

                  {data.deadline && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-bold ${isApproved ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Дедлайн: {new Date(data.deadline).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                </div>
              ) : data.submitted ? (
                <p className="text-xs md:text-sm text-slate-400 mt-2 italic">Задача не описана</p>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Ожидание ответа...
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 md:py-16 text-slate-400">
    <svg
      className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <p className="font-bold text-base md:text-lg">{message}</p>
  </div>
);
