/**
 * TaskPlanningForm — Phase 3 live form.
 *
 * No submit button. Every field blur and slider release calls onLiveUpdate
 * which fires user:update_live_vote. Data persists to Redis immediately and
 * is flushed to MongoDB when the creator advances the phase.
 */

import React from 'react';
import { Slider, DateTimePicker } from '@/src/shared/ui';
import { toDateInputValue } from '@/src/shared/lib';

interface TaskPlanningFormProps {
  commonQuestion: string;
  estimateHours: string;
  onEstimateHoursChange: (value: string) => void;
  onCommonQuestionChange: (value: string) => void;
  taskDescription: string;
  onTaskDescriptionChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
  expectedContribution: number;
  onExpectedContributionChange: (value: number) => void;
  /** Called on every field blur / slider release. Fires user:update_live_vote. */
  onLiveUpdate: () => void;
  isApproved?: boolean;
  /** True when all required fields are filled — until then the task is not persisted. */
  isValid?: boolean;
}

export const TaskPlanningForm: React.FC<TaskPlanningFormProps> = ({
  taskDescription,
  commonQuestion,
  deadline,
  onTaskDescriptionChange,
  estimateHours,
  onEstimateHoursChange,
  onCommonQuestionChange,
  onDeadlineChange,
  expectedContribution,
  onExpectedContributionChange,
  onLiveUpdate,
  isApproved = false,
  isValid = false,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        {taskDescription ? 'Моя задача' : 'Создать задачу'}
        {taskDescription && (
          <span
            className={`text-xs px-3 py-1 rounded-full border uppercase tracking-widest ${
              isApproved
                ? 'bg-green-100 text-green-600 border-green-200'
                : 'bg-amber-100 text-amber-600 border-amber-200'
            }`}
          >
            {isApproved ? 'Одобрено' : 'Ожидает одобрения'}
          </span>
        )}
        {isValid ? (
          <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap ml-auto">
            ● Автосохранение
          </span>
        ) : (
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap ml-auto">
            ● Заполните обязательные поля
          </span>
        )}
        <div className="h-px bg-slate-200 flex-1" />
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

        {!isApproved && !isValid && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z"
              />
            </svg>
            <p className="text-sm text-amber-800 font-medium">
              Задача сохранится автоматически, когда все поля отмеченные{' '}
              <span className="text-red-500 font-black">*</span> будут заполнены.
            </p>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
            Глобальное понимание задачи <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={commonQuestion}
            onChange={(e) => onCommonQuestionChange(e.target.value)}
            onBlur={onLiveUpdate}
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
            Описание вашей задачи <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={taskDescription}
            onChange={(e) => onTaskDescriptionChange(e.target.value)}
            onBlur={onLiveUpdate}
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
            Время на задачу(часы) <span className="text-red-500">*</span>
          </label>
          <input
            value={estimateHours}
            onChange={(e) => onEstimateHoursChange(e.target.value)}
            onBlur={onLiveUpdate}
            disabled={isApproved}
            className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
              isApproved
                ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-slate-50 border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900'
            }`}
            placeholder="Оцените время в часах"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
            Дедлайн <span className="text-red-500">*</span>
          </label>
          <DateTimePicker
            selected={deadline ? new Date(deadline) : null}
            onChange={(date: Date | null) => {
              if (date) {
                onDeadlineChange(toDateInputValue(date));
                // Date picker has no blur — fire immediately on change
                setTimeout(onLiveUpdate, 0);
              }
            }}
            disabled={isApproved}
            showTimeSelect={false}
            placeholder="Выберите дату"
            minDate={new Date()}
          />
        </div>

        {/* <div>
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
              onChangeEnd={onLiveUpdate}
              variant="importance"
              disabled={isApproved}
            />
          </div>
        </div> */}
      </div>
    </section>
  );
};
