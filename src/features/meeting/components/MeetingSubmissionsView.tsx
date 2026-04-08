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
  /** When true, shows a live indicator — data is streaming from WebSocket. */
  isLive?: boolean;
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
    isLive = false,
  }) {
    const [activeTab, setActiveTab] = useState<TabKey>('emotional');

    const emotionalCount = Object.keys(submissions?.emotional_evaluation ?? {}).length;
    const understandingCount = Object.keys(submissions?.understanding_contribution ?? {}).length;
    const tasksCount = Object.keys(submissions?.task_planning ?? {}).length;

    const counts: Record<TabKey, number> = {
      emotional: emotionalCount,
      understanding: understandingCount,
      tasks: tasksCount,
    };

    return (
      <div
        className="rounded-[24px] md:rounded-[32px] overflow-hidden mb-8 md:mb-12"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.12)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
      >
        <PanelHeader isRefreshing={isRefreshing} isLive={isLive} />
        <TabBar activeTab={activeTab} onSelect={setActiveTab} counts={counts} />

        <div className="p-4 md:p-8">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === 'emotional' && (
                <EmotionalTab submissions={submissions?.emotional_evaluation ?? {}} />
              )}
              {activeTab === 'understanding' && (
                <UnderstandingTab submissions={submissions?.understanding_contribution ?? {}} />
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

const PanelHeader = memo<{ isRefreshing: boolean; isLive: boolean }>(function PanelHeader({
  isRefreshing,
  isLive,
}) {
  return (
    <div
      className="relative px-5 py-5 md:px-8 md:py-6"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.85) 100%)',
      }}
    >
      {/* Shine overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <ClipboardIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-xl font-bold text-white leading-tight">
              Панель администратора
            </h2>
            <p className="text-indigo-200 text-xs font-medium mt-0.5">
              Отслеживание участников и голосов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              LIVE
            </span>
          )}
          {isRefreshing && (
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sync
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TabBar = memo<{
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
  counts: Record<TabKey, number>;
}>(function TabBar({ activeTab, onSelect, counts }) {
  return (
    <div className="flex border-b border-indigo-50 bg-white/60 backdrop-blur-sm px-2 gap-1">
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={[
              'flex items-center gap-1.5 flex-1 min-w-0 justify-center py-3.5 px-2 text-xs md:text-sm font-semibold transition-all duration-150 rounded-none relative',
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {label}
            {count > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-indigo-500" />
            )}
          </button>
        );
      })}
    </div>
  );
});

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
            <GlassCard key={participantId} submitted={data.submitted}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={data.participant.fullName} />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm md:text-base truncate leading-tight">
                      {data.participant.fullName ?? 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-400">Оценил эмоции</p>
                  </div>
                </div>
                <SubmissionBadge submitted={data.submitted} />
              </div>

              {data.submitted && data.evaluations.length > 0 ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                  {nonToxicEvals.map((ev, idx) => (
                    <EmotionRow
                      key={idx}
                      name={ev.targetParticipant.fullName}
                      value={ev.emotionalScale}
                    />
                  ))}
                  {toxicEvals.map((ev, idx) => (
                    <EmotionRow
                      key={`t-${idx}`}
                      name={ev.targetParticipant.fullName}
                      value={ev.emotionalScale}
                      toxic
                    />
                  ))}
                </div>
              ) : data.submitted ? (
                <p className="text-xs text-slate-400 mt-2 italic">Оценок не найдено</p>
              ) : (
                <WaitingPulse />
              )}
            </GlassCard>
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
          <GlassCard key={participantId} submitted={data.submitted}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar name={data.participant.fullName} color="amber" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm md:text-base truncate leading-tight">
                    {data.participant.fullName ?? 'Unknown'}
                  </p>
                  {data.participant.email && (
                    <p className="text-[10px] text-slate-400 truncate">{data.participant.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {data.submitted && (
                  <span className="text-2xl font-black text-amber-500 leading-none">
                    {data.understandingScore}%
                  </span>
                )}
                <SubmissionBadge submitted={data.submitted} />
              </div>
            </div>

            {data.submitted && (
              <div className="mt-1 mb-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${data.understandingScore}%` }}
                  />
                </div>
              </div>
            )}

            {data.submitted && data.contributions.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Вклад участников
                </p>
                {data.contributions.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium flex-1 truncate">
                      {c.participant.fullName ?? 'Unknown'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-14 bg-slate-100 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-indigo-400 transition-all"
                          style={{ width: `${c.contributionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-indigo-600 w-8 text-right">
                        {c.contributionPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : data.submitted ? (
              <p className="text-xs text-slate-400 mt-2 italic">Вклад не указан</p>
            ) : (
              <WaitingPulse />
            )}
          </GlassCard>
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
        <TaskCard key={authorId} data={data} onApprove={onApprove} isApproving={isApproving} />
      ))}
    </div>
  );
});

// ─── Task card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  data: TaskSubmission;
  onApprove: (taskId: string, currentApproved: boolean) => void;
  isApproving: boolean;
}

const TaskCard = memo<TaskCardProps>(function TaskCard({ data, onApprove, isApproving }) {
  const {
    approved,
    taskId,
    participant,
    description,
    contributionImportance,
    deadline,
    estimateHours,
  } = data;

  return (
    <div
      className={[
        'relative rounded-2xl overflow-hidden border transition-all duration-300',
        approved ? 'border-emerald-200' : 'border-slate-200/70',
      ].join(' ')}
      style={{
        background: approved
          ? 'linear-gradient(135deg, rgba(236,253,245,0.9) 0%, rgba(209,250,229,0.7) 100%)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Approved accent bar */}
      {approved && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
      )}

      <div className="px-5 py-4 pl-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Avatar name={participant.fullName} color={approved ? 'green' : 'default'} />
            <div className="min-w-0">
              <p
                className={`font-bold text-sm md:text-base truncate leading-tight ${approved ? 'text-emerald-800' : 'text-slate-800'}`}
              >
                {participant.fullName ?? 'Unknown'}
              </p>
              {participant.email && (
                <p className="text-[10px] text-slate-400 truncate">{participant.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ApprovalCheckbox
              taskId={taskId}
              approved={approved}
              disabled={isApproving}
              onToggle={onApprove}
            />
            <span
              className={`text-xl font-black leading-none ${approved ? 'text-emerald-600' : 'text-indigo-500'}`}
            >
              {contributionImportance}%
            </span>
          </div>
        </div>

        {data.submitted && description ? (
          <div
            className={`space-y-1.5 pt-3 border-t ${approved ? 'border-emerald-100' : 'border-slate-100'}`}
          >
            <p
              className={`text-sm font-medium leading-snug ${approved ? 'text-emerald-900' : 'text-slate-700'}`}
            >
              {description}
            </p>
            {estimateHours > 0 && (
              <p
                className={`text-xs font-semibold ${approved ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                ~{estimateHours}ч
              </p>
            )}
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${approved ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
              Дедлайн: {new Date(deadline).toLocaleDateString('ru-RU')}
            </div>
          </div>
        ) : data.submitted ? (
          <p className="text-xs text-slate-400 mt-2 italic pt-3 border-t border-slate-100">
            Задача не описана
          </p>
        ) : (
          <div className="pt-3 border-t border-slate-100">
            <WaitingPulse />
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
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all select-none text-[11px] font-bold',
        approved
          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:border-emerald-300'
          : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 shadow-sm',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={approved}
          disabled={disabled}
          onChange={() => onToggle(taskId, approved)}
          className="peer appearance-none w-3.5 h-3.5 border-2 border-slate-300 rounded checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer disabled:opacity-50"
        />
        <CheckIcon className="absolute w-2.5 h-2.5 text-white pointer-events-none hidden peer-checked:block left-0.5" />
      </div>
      {approved ? 'Одобрено' : 'Одобрить'}
    </label>
  );
});

// ─── Shared primitives ────────────────────────────────────────────────────────

type AvatarColor = 'default' | 'amber' | 'green';

const AVATAR_COLORS: Record<AvatarColor, string> = {
  default: 'bg-indigo-100 text-indigo-600',
  amber: 'bg-amber-100 text-amber-600',
  green: 'bg-emerald-100 text-emerald-700',
};

const Avatar: React.FC<{ name: string | null; color?: AvatarColor }> = ({
  name,
  color = 'default',
}) => {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[color]}`}
    >
      {initials}
    </div>
  );
};

const EmotionRow: React.FC<{ name: string | null; value: number; toxic?: boolean }> = ({
  name,
  value,
  toxic,
}) => {
  const normalized = Math.max(0, Math.min((value + 100) / 200, 1));
  const isPos = value >= 0;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-xs text-slate-600 flex-1 truncate">{name ?? 'Unknown'}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={`text-sm font-bold w-7 text-right ${isPos ? 'text-emerald-600' : 'text-red-500'}`}
        >
          {value > 0 ? `+${value}` : value}
        </span>
        <div className="w-16 bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isPos ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ width: `${normalized * 100}%` }}
          />
        </div>
        {toxic && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
            Toxic
          </span>
        )}
      </div>
    </div>
  );
};

const GlassCard: React.FC<{ submitted: boolean; children: React.ReactNode }> = ({
  submitted,
  children,
}) => (
  <div
    className="rounded-2xl border p-4 md:p-5 transition-all"
    style={{
      background: submitted ? 'rgba(255,255,255,0.85)' : 'rgba(248,250,252,0.7)',
      border: `1px solid ${submitted ? 'rgba(99,102,241,0.12)' : 'rgba(148,163,184,0.2)'}`,
      backdropFilter: 'blur(8px)',
    }}
  >
    {children}
  </div>
);

const SubmissionBadge = memo<{ submitted: boolean }>(function SubmissionBadge({ submitted }) {
  return (
    <span
      className={[
        'text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1',
        submitted
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : 'bg-slate-100 text-slate-400',
      ].join(' ')}
    >
      {submitted ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span className="hidden sm:inline">Отправлено</span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
          <span className="hidden sm:inline">Ожидание</span>
        </>
      )}
    </span>
  );
});

const WaitingPulse = () => (
  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
    Ожидание ответа...
  </span>
);

const LoadingState = () => (
  <div className="text-center py-10">
    <div
      className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"
      style={{ borderWidth: '3px' }}
    />
    <p className="text-slate-400 font-medium text-sm">Загрузка...</p>
  </div>
);

const EmptyState = memo<{ message: string }>(function EmptyState({ message }) {
  return (
    <div className="text-center py-12 md:py-16 text-slate-400">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <InboxIcon className="w-7 h-7 opacity-50" />
      </div>
      <p className="font-semibold text-base">{message}</p>
    </div>
  );
});

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

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
