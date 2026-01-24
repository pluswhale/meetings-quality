/**
 * TaskForm - Editable form for task details (author only)
 */

import React from 'react';

interface TaskFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
  contributionImportance: number;
  isAuthor: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  description,
  onDescriptionChange,
  deadline,
  onDeadlineChange,
  contributionImportance,
  isAuthor,
}) => {
  return (
    <>
      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
          Описание задачи
        </label>
        {isAuthor ? (
          <textarea
            className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 text-lg font-bold transition-all outline-none leading-relaxed shadow-sm"
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        ) : (
          <div className="px-8 py-6 bg-slate-50 rounded-[24px] border-l-4 border-blue-600">
            <p className="text-xl text-slate-800 font-bold leading-relaxed">{description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
            Крайний срок
          </label>
          {isAuthor ? (
            <input
              type="date"
              className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none shadow-sm"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
            />
          ) : (
            <p className="px-8 py-5 bg-slate-50 rounded-[20px] text-lg text-slate-900 font-black tracking-tight">
              {new Date(deadline).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
            Важность вклада
          </label>
          <div className="flex items-center gap-4 px-8 py-5 bg-blue-50 rounded-[20px]">
            <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${contributionImportance}%` }}
              />
            </div>
            <span className="text-2xl font-black text-blue-600 tabular-nums">
              {contributionImportance}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
