import React from 'react';
import { useCreateTaskViewModel } from './useCreateTaskViewModel';
import { formatDate } from '@/src/shared/lib';

export const CreateTaskView: React.FC = () => {
  const vm = useCreateTaskViewModel();

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
          <h1 className="text-2xl font-bold text-slate-900">Новая задача</h1>
          <p className="text-sm text-slate-500 mt-1">Создайте задачу в рамках встречи проекта</p>
        </header>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100">

          {/* Meeting selector */}
          <section className="p-8 space-y-4">
            <SectionLabel>Встреча *</SectionLabel>

            {vm.meetingsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : vm.meetings.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-sm text-amber-700 font-medium">
                  В этом проекте нет встреч. Сначала создайте встречу.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {vm.meetings.map((m) => {
                  const selected = vm.selectedMeetingId === m._id;
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => vm.setSelectedMeetingId(m._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        selected ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{m.title}</p>
                        <p className="text-xs text-slate-400">{formatDate(m.createdAt)}</p>
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

          {/* Task fields */}
          <section className="p-8 space-y-6">
            <SectionLabel>Детали задачи</SectionLabel>

            <Field label="Описание *">
              <textarea
                rows={3}
                value={vm.description}
                onChange={(e) => vm.setDescription(e.target.value)}
                placeholder="Что нужно сделать?"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </Field>

            <Field label="Общий вопрос *" hint="Контекст задачи из обсуждения">
              <textarea
                rows={2}
                value={vm.commonQuestion}
                onChange={(e) => vm.setCommonQuestion(e.target.value)}
                placeholder="Какой вопрос эта задача решает?"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </Field>

            <Field label="Дедлайн *">
              <input
                type="date"
                value={vm.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => vm.setDeadline(e.target.value)}
                className="px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Оценка (часы) *">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={vm.estimateHours}
                  onChange={(e) => vm.setEstimateHours(e.target.value)}
                  placeholder="8"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </Field>

              <Field label="Вклад (0–100%) *">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={vm.contributionImportance}
                  onChange={(e) => vm.setContributionImportance(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </Field>
            </div>
          </section>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            onClick={vm.handleSubmit}
            disabled={vm.isSubmitting || vm.meetings.length === 0}
            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {vm.isSubmitting ? 'Создание...' : 'Создать задачу'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{children}</p>
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
