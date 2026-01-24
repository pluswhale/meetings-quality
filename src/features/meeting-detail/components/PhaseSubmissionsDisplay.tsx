/**
 * PhaseSubmissionsDisplay - Shows detailed participant responses for each phase
 */

import React from 'react';
import { UserResponseDto, MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PhaseSubmissions } from '../types';

interface PhaseSubmissionsDisplayProps {
  phaseSubmissions: PhaseSubmissions | null;
  currentPhase: MeetingResponseDtoCurrentPhase;
  participants: UserResponseDto[];
}

export const PhaseSubmissionsDisplay: React.FC<PhaseSubmissionsDisplayProps> = ({
  phaseSubmissions,
  currentPhase,
  participants,
}) => {
  if (!phaseSubmissions) {
    return (
      <div className="text-sm bg-white p-6 rounded-2xl text-slate-500 text-center">
        Загрузка детальных данных...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-black text-blue-900 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        Детальные ответы участников
      </h4>

      {currentPhase === MeetingResponseDtoCurrentPhase.emotional_evaluation &&
        phaseSubmissions.emotionalEvaluations && (
          <div className="space-y-4">
            {Object.entries(phaseSubmissions.emotionalEvaluations).map(
              ([userId, data]: [string, any]) => {
                const user = participants.find((p) => p._id === userId);
                return (
                  <div key={userId} className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h5 className="font-black text-slate-900 mb-4">
                      {user?.fullName || 'Unknown User'}
                    </h5>
                    <div className="space-y-2 text-sm">
                      {data.evaluations?.map((evaluation: any, idx: number) => {
                        const targetUser = participants.find(
                          (p) => p._id === evaluation.targetParticipantId
                        );
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-slate-100"
                          >
                            <span className="text-slate-600">
                              {targetUser?.fullName || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold ${
                                  evaluation.emotionalScale >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {evaluation.emotionalScale > 0 ? '+' : ''}
                                {evaluation.emotionalScale}
                              </span>
                              {evaluation.isToxic && (
                                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-black rounded-full">
                                  Токсичен
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {currentPhase === MeetingResponseDtoCurrentPhase.understanding_contribution &&
        phaseSubmissions.understandingContributions && (
          <div className="space-y-4">
            {Object.entries(phaseSubmissions.understandingContributions).map(
              ([userId, data]: [string, any]) => {
                const user = participants.find((p) => p._id === userId);
                return (
                  <div key={userId} className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-black text-slate-900">
                        {user?.fullName || 'Unknown User'}
                      </h5>
                      <span className="text-2xl font-black text-blue-600">
                        {data.understandingScore}%
                      </span>
                    </div>
                    <h6 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      Оценка вклада:
                    </h6>
                    <div className="space-y-2 text-sm">
                      {data.contributions?.map((contrib: any, idx: number) => {
                        const targetUser = participants.find(
                          (p) => p._id === contrib.participantId
                        );
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-slate-100"
                          >
                            <span className="text-slate-600">
                              {targetUser?.fullName || 'Unknown'}
                            </span>
                            <span className="font-bold text-blue-600">
                              {contrib.contributionPercentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {currentPhase === MeetingResponseDtoCurrentPhase.task_planning &&
        phaseSubmissions.taskPlannings && (
          <div className="space-y-4">
            {Object.entries(phaseSubmissions.taskPlannings).map(
              ([userId, data]: [string, any]) => {
                const user = participants.find((p) => p._id === userId);
                return (
                  <div key={userId} className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h5 className="font-black text-slate-900 mb-3">
                      {user?.fullName || 'Unknown User'}
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Задача:
                        </span>
                        <p className="text-slate-700 font-medium mt-1">{data.taskDescription}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            Дедлайн:
                          </span>
                          <p className="text-slate-700 font-bold">
                            {new Date(data.deadline).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            Вклад:
                          </span>
                          <p className="text-2xl font-black text-blue-600">
                            {data.expectedContributionPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
    </div>
  );
};
