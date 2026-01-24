/**
 * TaskPlanningForm - Form for creating tasks (available to all in Phase 4)
 */

import React from 'react';

interface TaskPlanningFormProps {
  taskDescription: string;
  onTaskDescriptionChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
  expectedContribution: number;
  onExpectedContributionChange: (value: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const TaskPlanningForm: React.FC<TaskPlanningFormProps> = ({
  taskDescription,
  onTaskDescriptionChange,
  deadline,
  onDeadlineChange,
  expectedContribution,
  onExpectedContributionChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <>
      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          Создать задачу
          <div className="flex-1 h-px bg-slate-200" />
        </h2>
        <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Описание задачи
            </label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={(e) => onTaskDescriptionChange(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none"
              placeholder="Опишите задачу, которую нужно выполнить..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              Дедлайн
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Ожидаемый процент вклада
              </label>
              <span className="text-2xl font-black text-blue-600">{expectedContribution}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={expectedContribution}
              onChange={(e) => onExpectedContributionChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </section>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Создание...' : 'Создать задачу'}
      </button>
    </>
  );
};
