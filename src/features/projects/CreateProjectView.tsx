import React from 'react';
import { useCreateProjectViewModel } from './useCreateProjectViewModel';

export const CreateProjectView: React.FC = () => {
  const vm = useCreateProjectViewModel();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-10 md:px-12">
        {/* Back */}
        <button
          onClick={vm.handleNavigateBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </button>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Новый проект</h1>
          <p className="text-sm text-slate-500 mt-1">Создайте рабочее пространство для встреч и задач</p>
        </header>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100">
          {/* Project info */}
          <section className="p-8 space-y-6">
            <SectionLabel>Основная информация</SectionLabel>

            <Field label="Название *">
              <input
                type="text"
                value={vm.title}
                onChange={(e) => vm.setTitle(e.target.value)}
                placeholder="Например: Q2 Планирование"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </Field>

            <Field label="Цель" hint="Высокоуровневая цель проекта">
              <input
                type="text"
                value={vm.goal}
                onChange={(e) => vm.setGoal(e.target.value)}
                placeholder="Например: Повысить скорость разработки на 20%"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </Field>

            <Field label="Описание" hint="Подробный контекст для участников">
              <textarea
                rows={3}
                value={vm.description}
                onChange={(e) => vm.setDescription(e.target.value)}
                placeholder="Опишите область и ожидаемые результаты..."
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </Field>
          </section>

          {/* Participants */}
          <section className="p-8">
            <SectionLabel className="mb-4">
              Участники
              {vm.selectedParticipantIds.length > 0 && (
                <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {vm.selectedParticipantIds.length}
                </span>
              )}
            </SectionLabel>

            {vm.usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : vm.allUsers.length === 0 ? (
              <p className="text-sm text-slate-400">Нет доступных пользователей</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {vm.allUsers.map((user) => {
                  const selected = vm.selectedParticipantIds.includes(user._id);
                  const initials = user.fullName
                    .split(' ')
                    .map((n) => n.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('');
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => vm.toggleParticipant(user._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                      }`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      {selected && (
                        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            onClick={vm.handleSubmit}
            disabled={vm.isSubmitting || !vm.title.trim()}
            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {vm.isSubmitting ? 'Создание...' : 'Создать проект'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-xs font-semibold text-slate-400 uppercase tracking-widest ${className}`}>
    {children}
  </p>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);
