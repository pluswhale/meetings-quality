/**
 * TaskForm - Editable form for task details (author only)
 */

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';

registerLocale('ru', ru);

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
          Описание вашей задачи
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
            <DatePicker
              selected={deadline ? new Date(deadline) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  onDeadlineChange(date.toISOString().split('T')[0]);
                }
              }}
              dateFormat="dd.MM.yyyy"
              className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none shadow-sm"
              calendarClassName="!font-bold"
              locale="ru"
              placeholderText="Выберите дату"
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
          <div className="flex items-center gap-4 px-8 py-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-[20px] shadow-sm">
            <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${contributionImportance}%`,
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                }}
              />
            </div>
            <span className="text-2xl font-black text-purple-600 tabular-nums">
              {contributionImportance}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
