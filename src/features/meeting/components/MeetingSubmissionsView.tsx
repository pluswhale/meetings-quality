/**
 * MeetingSubmissionsView — pure presentational component.
 *
 * Rules enforced here:
 *   - No data fetching, no side effects.
 *   - No data transformation — all field access is direct and typed.
 *   - All conditionals extracted from JSX into typed variables before the return.
 *   - Sub-components are memoised to prevent re-renders from sibling tab state.
 */

import { memo, useState } from 'react';
import type {
  EmotionalSubmission,
  MeetingSubmissions,
  TaskSubmission,
  UnderstandingSubmission,
} from '../types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MeetingSubmissionsViewProps {
  submissions: MeetingSubmissions | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onApproveTask: (taskId: string, currentApproved: boolean) => void;
  isApprovingTask: boolean;
}

type TabKey = 'emotional' | 'understanding' | 'tasks';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'emotional', label: 'Эмоции' },
  { key: 'understanding', label: 'Понимание' },
  { key: 'tasks', label: 'Задачи' },
];

// ─── Root component ───────────────────────────────────────────────────────────

export const MeetingSubmissionsView = memo<MeetingSubmissionsViewProps>(
  function MeetingSubmissionsView({
    submissions,
    isLoading,
    isRefreshing,
    onApproveTask,
    isApprovingTask,
  }) {
    const [activeTab, setActiveTab] = useState<TabKey>('emotional');

    return (
      <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8 md:mb-12">
        <PanelHeader isRefreshing={isRefreshing} />
        <TabBar activeTab={activeTab} onSelect={setActiveTab} />

        <div className="p-4 md:p-8">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === 'emotional' && (
                <EmotionalTab
                  submissions={submissions?.emotional_evaluation ?? {}}
                />
              )}
              {activeTab === 'understanding' && (
                <UnderstandingTab
                  submissions={submissions?.understanding_contribution ?? {}}
                />
              )}
              {activeTab === 'tasks' && (
                <TasksTab
                  submissions={submissions?.task_planning ?? {}}
                  onApprove={onApproveTask}
                  isApproving={isApprovingTask}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

MeetingSubmissionsView.displayName = 'MeetingSubmissionsView';

// ─── Panel header ─────────────────────────────────────────────────────────────

const PanelHeader = memo<{ isRefreshing: boolean }>(function PanelHeader({ isRefreshing }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-8 relative">
      {isRefreshing && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-white">Обновление...</span>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        <ClipboardIcon className="w-6 h-6 md:w-8 md:h-8 text-white flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-2xl font-black text-white truncate">
            Панель администратора
          </h2>
          <p className="text-blue-100 text-xs md:text-sm font-bold mt-0.5 md:mt-1 truncate">
            Отслеживание участников и голосов
          </p>
        </div>
      </div>
    </div>
  );
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TabBar = memo<{ activeTab: TabKey; onSelect: (tab: TabKey) => void }>(
  function TabBar({ activeTab, onSelect }) {
    return (
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={[
              'flex-1 min-w-[80px] py-3 md:py-4 px-3 md:px-6 font-black text-xs md:text-sm transition-colors',
              activeTab === key
                ? 'bg-white text-blue-600 border-b-4 border-blue-600'
                : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    );
  },
);

// ─── Emotional tab ────────────────────────────────────────────────────────────

const EmotionalTab = memo<{ submissions: Record<string, EmotionalSubmission> }>(
  function EmotionalTab({ submissions }) {
    const entries = Object.entries(submissions);

    if (entries.length === 0) {
      return <EmptyState message="Нет оценок эмоций" />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {entries.map(([participantId, data]) => {
          const nonToxicEvals = data.evaluations.filter((e) => !e.isToxic);
          const toxicEvals = data.evaluations.filter((e) => e.isToxic);

          return (
            <div
              key={participantId}
              className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200"
            >
              <div className="flex items-start md:items-center justify-between mb-3 md:mb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 font-medium text-[11px]">Отправитель:</span>
                  <span className="font-black text-slate-900 text-base md:text-lg block truncate">
                    {data.participant.fullName ?? 'Unknown'}
                  </span>
                </div>
                <SubmissionBadge submitted={data.submitted} />
              </div>

              {data.submitted && data.evaluations.length > 0 ? (
                <div className="space-y-1.5 md:space-y-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                  {nonToxicEvals.map((evaluation, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 md:py-2 gap-2"
                    >
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">
                        {evaluation.targetParticipant.fullName ?? 'Unknown'}
                      </span>
                      <span
                        className={[
                          'font-black text-base md:text-lg',
                          evaluation.emotionalScale >= 0 ? 'text-green-600' : 'text-red-600',
                        ].join(' ')}
                      >
                        {evaluation.emotionalScale > 0 ? '+' : ''}
                        {evaluation.emotionalScale}
                      </span>
                    </div>
                  ))}

                  {toxicEvals.map((evaluation, idx) => (
                    <div
                      key={`toxic-${idx}`}
                      className="flex justify-between items-center py-1 md:py-2 gap-2"
                    >
                      <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">
                        {evaluation.targetParticipant.fullName ?? 'Unknown'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-black text-base md:text-lg text-red-600">
                          {evaluation.emotionalScale > 0 ? '+' : ''}
                          {evaluation.emotionalScale}
                        </span>
                        <span className="text-[10px] md:text-xs bg-red-100 text-red-600 px-1.5 md:px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                          Токсичен
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.submitted ? (
                <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                  Оценок не найдено
                </p>
              ) : (
                <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                  Ожидание ответа...
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

// ─── Understanding tab ────────────────────────────────────────────────────────

const UnderstandingTab = memo<{ submissions: Record<string, UnderstandingSubmission> }>(
  function UnderstandingTab({ submissions }) {
    const entries = Object.entries(submissions);

    if (entries.length === 0) {
      return <EmptyState message="Нет оценок понимания" />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {entries.map(([participantId, data]) => (
          <div
            key={participantId}
            className="bg-slate-50 p-6 rounded-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <span className="font-black text-slate-900 text-lg block truncate">
                  {data.participant.fullName ?? 'Unknown'}
                </span>
                {data.participant.email !== null && (
                  <p className="text-xs text-slate-400 mt-1 truncate">{data.participant.email}</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {data.submitted && (
                  <span className="text-3xl font-black text-green-600 leading-none">
                    {data.understandingScore}%
                  </span>
                )}
                <SubmissionBadge submitted={data.submitted} />
              </div>
            </div>

            {data.submitted && data.contributions.length > 0 ? (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                <div className="text-[10px] md:text-xs font-black text-slate-400 mb-2 md:mb-3">
                  Вклад участников:
                </div>
                {data.contributions.map((contrib, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 md:py-2 gap-2"
                  >
                    <span className="text-slate-600 font-medium text-xs md:text-sm truncate flex-1">
                      {contrib.participant.fullName ?? 'Unknown'}
                    </span>
                    <span className="font-black text-base md:text-lg text-blue-600 flex-shrink-0">
                      {contrib.contributionPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : data.submitted ? (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Вклад не указан
              </p>
            ) : (
              <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 italic">
                Ожидание ответа...
              </p>
            )}
          </div>
        ))}
      </div>
    );
  },
);

// ─── Tasks tab ────────────────────────────────────────────────────────────────

interface TasksTabProps {
  submissions: Record<string, TaskSubmission>;
  onApprove: (taskId: string, currentApproved: boolean) => void;
  isApproving: boolean;
}

const TasksTab = memo<TasksTabProps>(function TasksTab({ submissions, onApprove, isApproving }) {
  const entries = Object.entries(submissions);

  if (entries.length === 0) {
    return <EmptyState message="Нет созданных задач" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {entries.map(([authorId, data]) => (
        <TaskCard
          key={authorId}
          data={data}
          onApprove={onApprove}
          isApproving={isApproving}
        />
      ))}
    </div>
  );
});

// ─── Task card ────────────────────────────────────────────────────────────────
// Extracted to its own memoised component so toggling one card's approval state
// does not re-render the entire grid.

interface TaskCardProps {
  data: TaskSubmission;
  onApprove: (taskId: string, currentApproved: boolean) => void;
  isApproving: boolean;
}

const TaskCard = memo<TaskCardProps>(function TaskCard({ data, onApprove, isApproving }) {
  const { approved, taskId, participant, description, contributionImportance, deadline, estimateHours } = data;

  return (
    <div
      className={[
        'relative p-6 rounded-2xl border transition-all duration-300',
        approved
          ? 'bg-green-50/50 border-green-300 shadow-sm'
          : 'bg-slate-50 border-slate-200',
      ].join(' ')}
    >
      {approved && (
        <div className="absolute left-0 top-6 bottom-6 w-1 bg-green-400 rounded-r-full" />
      )}

      <div className="flex items-center justify-between mb-4 pl-2">
        <div className="min-w-0 flex-1 mr-2">
          <span
            className={[
              'font-black text-lg block truncate',
              approved ? 'text-green-900' : 'text-slate-900',
            ].join(' ')}
          >
            {participant.fullName ?? 'Unknown'}
          </span>
          {participant.email !== null && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{participant.email}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ApprovalCheckbox
            taskId={taskId}
            approved={approved}
            disabled={isApproving}
            onToggle={onApprove}
          />

          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-purple-600 leading-none">
              {contributionImportance}%
            </span>
          </div>
        </div>
      </div>

      <div className="pl-2">
        {data.submitted && description ? (
          <div
            className={[
              'mt-3 pt-3 border-t space-y-2',
              approved ? 'border-green-100' : 'border-slate-200',
            ].join(' ')}
          >
            <p
              className={[
                'font-medium text-sm md:text-base',
                approved ? 'text-green-900' : 'text-slate-700',
              ].join(' ')}
            >
              {description}
            </p>

            {estimateHours > 0 && (
              <p
                className={[
                  'text-xs font-bold',
                  approved ? 'text-green-700' : 'text-slate-500',
                ].join(' ')}
              >
                ~{estimateHours}ч
              </p>
            )}

            <div
              className={[
                'flex items-center gap-1.5 text-xs font-bold',
                approved ? 'text-green-600' : 'text-slate-400',
              ].join(' ')}
            >
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span>Дедлайн: {new Date(deadline).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        ) : data.submitted ? (
          <p className="text-xs md:text-sm text-slate-400 mt-2 italic">Задача не описана</p>
        ) : (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              Ожидание ответа...
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Approval checkbox ────────────────────────────────────────────────────────

interface ApprovalCheckboxProps {
  taskId: string;
  approved: boolean;
  disabled: boolean;
  onToggle: (taskId: string, currentApproved: boolean) => void;
}

const ApprovalCheckbox = memo<ApprovalCheckboxProps>(function ApprovalCheckbox({
  taskId,
  approved,
  disabled,
  onToggle,
}) {
  return (
    <label
      className={[
        'flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none',
        approved
          ? 'bg-white border-green-200 hover:border-green-300'
          : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={approved}
          disabled={disabled}
          onChange={() => onToggle(taskId, approved)}
          className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded checked:bg-green-500 checked:border-green-500 transition-colors cursor-pointer disabled:opacity-50"
        />
        <CheckIcon className="absolute w-3 h-3 text-white pointer-events-none hidden peer-checked:block left-0.5" />
      </div>
      <span
        className={[
          'text-[10px] uppercase tracking-wider font-black',
          approved ? 'text-green-600' : 'text-slate-400',
        ].join(' ')}
      >
        {approved ? 'Одобрено' : 'Одобрить'}
      </span>
    </label>
  );
});

// ─── Shared primitives ────────────────────────────────────────────────────────

const SubmissionBadge = memo<{ submitted: boolean }>(function SubmissionBadge({ submitted }) {
  return (
    <span
      className={[
        'text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0',
        submitted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500',
      ].join(' ')}
    >
      {submitted ? '✓' : '○'}
      <span className="hidden sm:inline ml-1">{submitted ? 'Отправлено' : 'Не отправлено'}</span>
    </span>
  );
});

const LoadingState = () => (
  <div className="text-center py-8 md:py-12">
    <div className="animate-spin w-6 h-6 md:w-8 md:h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3 md:mb-4" />
    <p className="text-slate-400 font-bold text-sm md:text-base">Загрузка...</p>
  </div>
);

const EmptyState = memo<{ message: string }>(function EmptyState({ message }) {
  return (
    <div className="text-center py-12 md:py-16 text-slate-400">
      <InboxIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-50" />
      <p className="font-bold text-base md:text-lg">{message}</p>
    </div>
  );
});

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
// Inlined as typed components to avoid a dependency on an icon library.

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path
      fillRule="evenodd"
      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
      clipRule="evenodd"
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const InboxIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);
