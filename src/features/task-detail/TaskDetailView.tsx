import React from 'react';
import { useParams } from 'react-router-dom';
import { useTaskDetailViewModel } from './useTaskDetailViewModel';

export const TaskDetailView: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const vm = useTaskDetailViewModel(id);

  if (vm.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Загрузка задачи...</p>
        </div>
      </div>
    );
  }

  if (!vm.task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500 font-medium">Задача не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-10 md:px-12">
        {/* Back */}
        <button
          onClick={vm.handleNavigateBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад
        </button>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Задача</h1>
            <StatusBadge isCompleted={vm.isCompleted} />
          </div>
          <p className="text-sm text-slate-500">
            из встречи:{' '}
            <span className="font-medium text-slate-700">{vm.task.meetingId.title}</span>
          </p>
        </header>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100">
          {/* Main info */}
          <section className="p-8 space-y-6">
            <Field label="Описание">
              {vm.isAuthor ? (
                <textarea
                  rows={3}
                  value={vm.description}
                  onChange={(e) => vm.setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{vm.description}</p>
              )}
            </Field>

            <Field label="Дедлайн">
              {vm.isAuthor ? (
                <input
                  type="date"
                  value={vm.deadline}
                  onChange={(e) => vm.setDeadline(e.target.value)}
                  className="px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {new Date(vm.task.deadline).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-6">
              <ReadOnlyField label="Оценка" value={`${vm.task.estimateHours} ч`} />
              <ReadOnlyField label="Вклад" value={`${vm.task.contributionImportance}%`} />
            </div>
          </section>

          {/* Status toggle (author only) */}
          {vm.isAuthor && (
            <section className="p-8">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Статус
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => vm.setIsCompleted(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    !vm.isCompleted
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  В процессе
                </button>
                <button
                  onClick={() => vm.setIsCompleted(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    vm.isCompleted
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  Завершена
                </button>
              </div>
            </section>
          )}

          {/* Assignee */}
          <section className="p-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Ответственный
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(vm.task.authorId.fullName ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {vm.isAuthor ? 'Вы' : vm.task.authorId.fullName}
                </p>
                {vm.task.authorId.email && (
                  <p className="text-xs text-slate-400">{vm.task.authorId.email}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Save (author only) */}
        {vm.isAuthor && (
          <div className="mt-6">
            <button
              onClick={vm.handleSave}
              disabled={vm.isUpdating}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {vm.isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ isCompleted: boolean }> = ({ isCompleted }) => (
  <span
    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
      isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}
  >
    {isCompleted ? 'Завершена' : 'В процессе'}
  </span>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5 flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700">{value}</p>
  </div>
);
