/**
 * TaskPlanningForm - Form for creating tasks (available to all in Phase 4)
 */

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import { Slider } from '@/src/shared/ui';

registerLocale('ru', ru);

interface TaskPlanningFormProps {
  commonQuestion: string;
  onCommonQuestionChange: (value: string) => void;
  taskDescription: string;
  onTaskDescriptionChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
  expectedContribution: number;
  onExpectedContributionChange: (value: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isApproved?: boolean;
}

export const TaskPlanningForm: React.FC<TaskPlanningFormProps> = ({
  taskDescription,
  commonQuestion,
  deadline,
  onTaskDescriptionChange,
  onCommonQuestionChange,
  onDeadlineChange,
  expectedContribution,
  onExpectedContributionChange,
  onSubmit,
  isSubmitting,
  isApproved = false,
}) => {
  return (
    <>
      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          {taskDescription ? 'Моя задача' : 'Создать задачу'}
          {taskDescription && (
            <span className={`text-xs px-3 py-1 rounded-full border uppercase tracking-widest ${
              isApproved 
                ? 'bg-green-100 text-green-600 border-green-200'
                : 'bg-amber-100 text-amber-600 border-amber-200'
            }`}>
              {isApproved ? 'Одобрено' : 'Ожидает одобрения'}
            </span>
          )}
          <div className="flex-1 h-px bg-slate-200" />
        </h2>

        <div
          className={`p-10 bg-white border rounded-[40px] shadow-lg shadow-slate-100 space-y-6 transition-colors ${
            isApproved ? 'border-green-200 bg-slate-50/50' : 'border-slate-200'
          }`}
        >
          {isApproved && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-blue-800 font-medium">
                Задача одобрена организатором. Редактирование заблокировано.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Глобальное понимание задачи
            </label>
            <textarea
              rows={4}
              value={commonQuestion}
              onChange={(e) => onCommonQuestionChange(e.target.value)}
              disabled={isApproved}
              className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                isApproved
                  ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900'
              }`}
              placeholder="Опишите, как вы поняли глобальную задачу..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Описание вашей задачи
            </label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={(e) => onTaskDescriptionChange(e.target.value)}
              disabled={isApproved}
              className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                isApproved
                  ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900'
              }`}
              placeholder="Опишите задачу, которую нужно выполнить..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Дедлайн
            </label>
            <div className={isApproved ? 'pointer-events-none opacity-60' : ''}>
              <DatePicker
                selected={deadline ? new Date(deadline) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    onDeadlineChange(date.toISOString().split('T')[0]);
                  }
                }}
                disabled={isApproved}
                dateFormat="dd.MM.yyyy"
                className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                  isApproved
                    ? 'bg-slate-100 border-slate-200 text-slate-500'
                    : 'bg-slate-50 border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900'
                }`}
                calendarClassName="!font-bold"
                locale="ru"
                placeholderText="Выберите дату"
                minDate={new Date()}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Ожидаемый процент вклада
              </label>
              <span
                className={`text-2xl font-black tabular-nums ${isApproved ? 'text-slate-400' : 'text-purple-600'}`}
              >
                {expectedContribution}%
              </span>
            </div>
            <div className={`mt-2 ${isApproved ? 'pointer-events-none opacity-60' : ''}`}>
              <Slider
                value={expectedContribution}
                onChange={onExpectedContributionChange}
                variant="importance"
                disabled={isApproved}
              />
            </div>
          </div>
        </div>
      </section>

      {!isApproved && (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      )}
    </>
  );
};
