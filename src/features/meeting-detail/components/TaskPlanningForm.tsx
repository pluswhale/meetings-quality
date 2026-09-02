/**
 * TaskPlanningForm — Phase 3 live form.
 *
 * Several task rows per participant, plus meeting-level «Выводы встречи»
 * (creator edits, everyone else reads). Incomplete drafts stay local.
 */

import React from 'react';
import { DateTimePicker } from '@/src/shared/ui';
import { toDateInputValue } from '@/src/shared/lib';
import type { PlanningTaskDraft } from '../state/meetingDetail.types';

interface TaskPlanningFormProps {
  tasks: PlanningTaskDraft[];
  onUpdateTask: (taskKey: string, patch: Partial<PlanningTaskDraft>) => void;
  onChangeEstimateHours: (taskKey: string, value: string) => void;
  onAddTask: () => void;
  onRemoveTask: (taskKey: string) => void;
  isTaskApproved: (taskKey: string) => boolean;
  isDraftComplete: (task: PlanningTaskDraft) => boolean;
  onLiveUpdate: () => void;
  conclusions: string;
  onConclusionsChange: (value: string) => void;
  isCreator: boolean;
}

export const TaskPlanningForm: React.FC<TaskPlanningFormProps> = ({
  tasks,
  onUpdateTask,
  onChangeEstimateHours,
  onAddTask,
  onRemoveTask,
  isTaskApproved,
  isDraftComplete,
  onLiveUpdate,
  conclusions,
  onConclusionsChange,
  isCreator,
}) => {
  const anyComplete = tasks.some(isDraftComplete);

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
        Задачи
        {anyComplete ? (
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

      <div className="p-8 md:p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100 space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Выводы встречи
        </label>
        {isCreator ? (
          <textarea
            rows={4}
            value={conclusions}
            onChange={(e) => onConclusionsChange(e.target.value)}
            className="w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none bg-slate-50 border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900"
            placeholder="Сформулируйте выводы встречи для всей группы..."
          />
        ) : (
          <div className="w-full px-6 py-4 border-2 rounded-2xl font-bold bg-slate-50 border-slate-100 text-slate-700 min-h-[6rem] whitespace-pre-wrap">
            {conclusions.trim() ? (
              conclusions
            ) : (
              <span className="text-slate-400 font-medium">Организатор ещё не заполнил выводы встречи.</span>
            )}
          </div>
        )}
      </div>

      {tasks.map((task, index) => {
        const approved = isTaskApproved(task.taskKey);
        const valid = isDraftComplete(task);
        return (
          <div
            key={task.taskKey}
            className={`p-8 md:p-10 bg-white border rounded-[40px] shadow-lg shadow-slate-100 space-y-6 transition-colors ${
              approved ? 'border-green-200 bg-slate-50/50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-black text-slate-900">
                {task.description.trim() || `Задача ${index + 1}`}
              </h3>
              {task.description.trim() && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border uppercase tracking-widest ${
                    approved
                      ? 'bg-green-100 text-green-600 border-green-200'
                      : 'bg-amber-100 text-amber-600 border-amber-200'
                  }`}
                >
                  {approved ? 'Одобрено' : 'Ожидает одобрения'}
                </span>
              )}
              {!approved && tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveTask(task.taskKey)}
                  className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                >
                  Удалить
                </button>
              )}
            </div>

            {approved && (
              <p className="text-sm text-blue-800 font-medium bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                Задача одобрена организатором. Редактирование заблокировано.
              </p>
            )}

            {!approved && !valid && (
              <p className="text-sm text-amber-800 font-medium bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                Задача сохранится автоматически, когда все поля отмеченные{' '}
                <span className="text-red-500 font-black">*</span> будут заполнены.
              </p>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Описание вашей задачи <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={task.description}
                onChange={(e) => onUpdateTask(task.taskKey, { description: e.target.value })}
                onBlur={onLiveUpdate}
                disabled={approved}
                className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                  approved
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
                value={task.estimateHours}
                onChange={(e) => onChangeEstimateHours(task.taskKey, e.target.value)}
                onBlur={onLiveUpdate}
                disabled={approved}
                className={`w-full px-6 py-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                  approved
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
                selected={task.deadline ? new Date(task.deadline) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    onUpdateTask(task.taskKey, { deadline: toDateInputValue(date) });
                    setTimeout(onLiveUpdate, 0);
                  }
                }}
                disabled={approved}
                showTimeSelect={false}
                placeholder="Выберите дату"
                minDate={new Date()}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddTask}
        className="w-full py-4 rounded-[24px] border-2 border-dashed border-slate-300 text-sm font-black uppercase tracking-[0.15em] text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
      >
        + Добавить задачу
      </button>
    </section>
  );
};
