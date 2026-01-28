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
}

export const CreatorSubmissionsPanel: React.FC<CreatorSubmissionsPanelProps> = ({
  submissions,
  participants,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'emotional' | 'understanding' | 'tasks'>('emotional');

  return (
    <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8 md:mb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-8">
        <div className="flex items-center gap-2 md:gap-3">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-white truncate">Панель создателя</h2>
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
              <EmotionalTab submissions={submissions?.emotional_evaluation} participants={participants} />
            )}
            {activeTab === 'understanding' && (
              <UnderstandingTab submissions={submissions?.understanding_contribution} participants={participants} />
            )}
            {activeTab === 'tasks' && (
              <TasksTab submissions={submissions?.task_planning} participants={participants} />
            )}
          </>
        )}
      </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName = data.participant?.fullName || 
                               participants.find((p) => p._id === userId)?.fullName || 
                               'Unknown';
        
        return (
          <div key={userId} className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200">
            <div className="flex items-start md:items-center justify-between mb-3 md:mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-black text-slate-900 text-base md:text-lg block truncate">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-0.5 md:mt-1 truncate">{data.participant.email}</p>
                )}
              </div>
              <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {data.submitted ? '✓' : '○'}
                <span className="hidden sm:inline ml-1">{data.submitted ? 'Отправлено' : 'Не отправлено'}</span>
              </span>
            </div>
            
            {data.submitted && data.evaluations && data.evaluations.length > 0 ? (
              <div className="space-y-1.5 md:space-y-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                {data.evaluations.map((evaluation: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center py-1 md:py-2 gap-2">
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">{evaluation.targetParticipant?.fullName || 'Unknown'}</span>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        <span className={`font-black text-base md:text-lg ${evaluation.emotionalScale >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {evaluation.emotionalScale > 0 ? '+' : ''}{evaluation.emotionalScale}
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
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Оценок не найдено</p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Ожидание ответа...</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName = data.participant?.fullName || 
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
                  <span className="text-3xl font-black text-green-600">{data.understandingScore}%</span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
                </span>
              </div>
            </div>
            
            {data.submitted && data.contributions && data.contributions.length > 0 ? (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                <div className="text-[10px] md:text-xs font-black text-slate-400 mb-2 md:mb-3">Вклад участников:</div>
                {data.contributions.map((contrib: any, idx: number) => {
                  return (
                    <div key={idx} className="flex justify-between items-center py-1 md:py-2 gap-2">
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">{contrib.participant?.fullName || 'Unknown'}</span>
                      <span className="font-black text-base md:text-lg text-blue-600 flex-shrink-0">{contrib.contributionPercentage}%</span>
                    </div>
                  );
                })}
              </div>
            ) : data.submitted ? (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Вклад не указан</p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Ожидание ответа...</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Object.entries(submissions).map(([userId, data]) => {
        const participantName = data.participant?.fullName || 
                               participants.find((p) => p._id === userId)?.fullName || 
                               'Unknown';
        
        return (
          <div key={userId} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-black text-slate-900 text-lg">{participantName}</span>
                {data.participant?.email && (
                  <p className="text-xs text-slate-400 mt-1">{data.participant.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {data.submitted && data.expectedContributionPercentage !== undefined && (
                  <span className="text-2xl font-black text-purple-600">{data.expectedContributionPercentage}%</span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  data.submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {data.submitted ? '✓ Отправлено' : 'Не отправлено'}
                </span>
              </div>
            </div>
            
            {data.submitted && data.taskDescription ? (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200 space-y-2 md:space-y-3">
                <p className="text-slate-700 font-medium text-sm md:text-base">{data.taskDescription}</p>
                {data.deadline && (
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-500">
                    <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold truncate">{new Date(data.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            ) : data.submitted ? (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Задача не описана</p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">Ожидание ответа...</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 md:py-16 text-slate-400">
    <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="font-bold text-base md:text-lg">{message}</p>
  </div>
);
