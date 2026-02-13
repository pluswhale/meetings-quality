/**
 * TaskEvaluationForm - For participants to evaluate task importance
 * Used in TASK_EVALUATION phase
 */

import React, { useState, useEffect } from 'react';
import { UserResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { Slider } from '@/src/shared/ui';

interface TaskWithAuthor {
  authorId: string;
  author: UserResponseDto | null;
  taskDescription: string;
  commonQuestion: string;
  deadline: string;
  originalContribution: number;
}

interface TaskEvaluationFormProps {
  tasks: TaskWithAuthor[];
  onEvaluationChange: (evaluations: Record<string, number>) => Promise<void>;
  existingEvaluation?: Record<string, number>;
}

export const TaskEvaluationForm: React.FC<TaskEvaluationFormProps> = ({
  tasks,
  onEvaluationChange,
  existingEvaluation,
}) => {
  const [evaluations, setEvaluations] = useState<Record<string, number>>(existingEvaluation || {});

  useEffect(() => {
    // Initialize all tasks with default score of 50 if not already evaluated
    const initialEvaluations: Record<string, number> = {};
    tasks.forEach((task) => {
      initialEvaluations[task.authorId] = existingEvaluation?.[task.authorId] ?? 50;
    });
    setEvaluations(initialEvaluations);
  }, [tasks, existingEvaluation]);

  const handleScoreChange = (authorId: string, score: number) => {
    const newEvaluations = {
      ...evaluations,
      [authorId]: score,
    };
    setEvaluations(newEvaluations);
  };

  const handleScoreChangeEnd = () => {
    // Auto-save when slider is released
    onEvaluationChange(evaluations);
  };

  const averageScore =
    Object.values(evaluations).length > 0
      ? Math.round(
          Object.values(evaluations).reduce((a, b) => a + b, 0) / Object.values(evaluations).length,
        )
      : 0;

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-50 rounded-[24px] md:rounded-[32px] p-6 md:p-12 text-center">
        <svg
          className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-base md:text-lg font-black text-slate-400">Нет задач для оценки</p>
        <p className="text-xs md:text-sm text-slate-400 mt-2">
          Задачи появятся после фазы планирования
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black mb-2 flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">📊</span>
              Оцените важность задач
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                ✓ Автосохранение
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-bold">
              Оцените объективную важность каждой задачи от 0 до 100
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-blue-200 flex-shrink-0">
            <p className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-wider mb-1 md:mb-2">
              Средняя оценка
            </p>
            <p className="text-3xl md:text-4xl font-black text-blue-700 tabular-nums">
              {averageScore}
            </p>
          </div>
        </div>

        {/* Task Evaluation Cards */}
        <div className="space-y-4 md:space-y-6">
          {tasks.map((task) => {
            const score = evaluations[task.authorId] || 50;
            const author = task.author;

            return (
              <div
                key={task.authorId}
                className="bg-white border-2 border-slate-200 rounded-[20px] md:rounded-[32px] p-4 md:p-6 shadow-lg shadow-slate-100 hover:shadow-xl hover:border-blue-300 transition-all"
              >
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b-2 border-slate-100">
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-base md:text-lg flex-shrink-0">
                      {author?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-sm md:text-base truncate">
                        {author?.fullName || 'Unknown'}
                      </h3>
                      <p className="text-[10px] md:text-xs text-slate-400 font-bold truncate">
                        {author?.email || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-purple-50 px-2 md:px-3 py-1 rounded-full">
                      <span className="text-[10px] md:text-xs font-black text-purple-600">
                        Оригинал: {task.originalContribution}%
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 md:px-4 py-1 md:py-2 rounded-xl md:rounded-2xl">
                      <span className="text-lg md:text-2xl font-black text-white tabular-nums">
                        {score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="mb-4 md:mb-6">
                  <div className="mb-3 md:mb-4">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider mb-1 md:mb-2">
                      Общий вопрос
                    </p>
                    <p className="text-xs md:text-sm font-bold text-slate-600 bg-slate-50 p-2 md:p-3 rounded-xl">
                      {task.commonQuestion}
                    </p>
                  </div>

                  <div className="mb-3 md:mb-4">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider mb-1 md:mb-2">
                      Описание вашей задачи
                    </p>
                    <p className="text-sm md:text-base font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl">
                      {task.taskDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-500">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
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
                    <span className="font-bold truncate">
                      Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                {/* Importance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <label className="text-xs md:text-sm font-black text-slate-600 uppercase tracking-wider">
                      Важность задачи
                    </label>
                    <span
                      className={`text-2xl md:text-3xl font-black tabular-nums ${
                        score >= 75
                          ? 'text-green-600'
                          : score >= 50
                            ? 'text-blue-600'
                            : score >= 25
                              ? 'text-orange-600'
                              : 'text-red-600'
                      }`}
                    >
                      {score}
                    </span>
                  </div>
                  <Slider
                    value={score}
                    onChange={(value) => handleScoreChange(task.authorId, value)}
                    onChangeEnd={handleScoreChangeEnd}
                    variant={
                      score >= 75
                        ? 'green'
                        : score >= 50
                          ? 'default'
                          : score >= 25
                            ? 'orange'
                            : 'red'
                    }
                  />
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-400 mt-1 md:mt-2">
                    <span className="text-red-500">0 - Не важно</span>
                    <span className="text-orange-500">25</span>
                    <span className="text-blue-500">50</span>
                    <span className="text-green-500">100 - Критично</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help Text */}
      <div className="p-3 md:p-4 bg-green-50 border-2 border-green-200 rounded-xl md:rounded-2xl">
        <p className="text-xs md:text-sm text-green-700 font-bold flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Ваши оценки автоматически сохраняются при изменении слайдеров. Оцените важность каждой
            задачи объективно.
          </span>
        </p>
      </div>
    </>
  );
};
