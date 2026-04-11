/**
 * CreatorAdminPanel — Панель управления встречей для организатора.
 *
 * Данные только из Zustand (WebSocket) — без REST, без polling.
 *
 * Правила одобрения задач (Phase 3):
 *   pending  → можно только «Одобрить»
 *   approved → показывает «Одобрено» + кнопку «Отклонить»
 *   rejected → показывает «Отклонено» + кнопку «Одобрить снова»
 *   pending  → «Отклонить» НЕДОСТУПНО
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useMeetingStore,
  selectVotes,
  selectVotingProgress,
  selectPendingVoters,
  selectParticipants,
  selectTaskApprovals,
  type LiveVoteEntry,
  type MeetingPhase,
  type ActiveParticipant,
} from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from '../hooks/useMeetingSocket';

// ─── Типы ─────────────────────────────────────────────────────────────────────

/** Явные состояния одобрения задачи. */
type ApprovalState = 'pending' | 'approved' | 'rejected';

function resolveApproval(raw: boolean | undefined): ApprovalState {
  if (raw === true) return 'approved';
  if (raw === false) return 'rejected';
  return 'pending';
}

// ─── Метаданные фаз ───────────────────────────────────────────────────────────

const NEXT_PHASE: Partial<Record<MeetingPhase, MeetingPhase>> = {
  retrospective: 'emotional_evaluation',
  emotional_evaluation: 'understanding_contribution',
  understanding_contribution: 'task_planning',
  task_planning: 'finished',
};

interface PhaseMeta {
  label: string;
  accent: string;
  headerBg: string;
  barColor: string;
  dotColor: string;
}

const PHASE_META: Record<MeetingPhase, PhaseMeta> = {
  retrospective: {
    label: 'Ретроспектива',
    accent: '#2563eb',
    headerBg: 'from-blue-50 to-slate-50',
    barColor: 'bg-blue-600',
    dotColor: 'bg-blue-600',
  },
  emotional_evaluation: {
    label: 'Обсуждение',
    accent: '#0f172a',
    headerBg: 'from-slate-50 to-slate-50',
    barColor: 'bg-slate-700',
    dotColor: 'bg-slate-700',
  },
  understanding_contribution: {
    label: 'Вклад участников',
    accent: '#2563eb',
    headerBg: 'from-blue-50 to-slate-50',
    barColor: 'bg-blue-600',
    dotColor: 'bg-blue-600',
  },
  task_planning: {
    label: 'Планирование задач',
    accent: '#16a34a',
    headerBg: 'from-green-50 to-slate-50',
    barColor: 'bg-green-600',
    dotColor: 'bg-green-600',
  },
  task_evaluation: {
    label: 'Оценка задач',
    accent: '#2563eb',
    headerBg: 'from-blue-50 to-slate-50',
    barColor: 'bg-blue-600',
    dotColor: 'bg-blue-600',
  },
  finished: {
    label: 'Завершено',
    accent: '#16a34a',
    headerBg: 'from-green-50 to-slate-50',
    barColor: 'bg-green-600',
    dotColor: 'bg-green-600',
  },
};

// ─── Корневой компонент ───────────────────────────────────────────────────────

interface Props {
  meetingId: string;
  socket: UseMeetingSocketReturn;
}

export const CreatorAdminPanel: React.FC<Props> = ({ meetingId: _meetingId, socket }) => {
  const rawPhase = useMeetingStore((s) => s.phase);
  const phase: MeetingPhase = rawPhase ?? 'emotional_evaluation';
  const votes = useMeetingStore(selectVotes);
  const progress = useMeetingStore(selectVotingProgress);
  const pending = useMeetingStore(selectPendingVoters);
  const participants = useMeetingStore(selectParticipants);
  const taskApprovals = useMeetingStore(selectTaskApprovals);

  const [collapsed, setCollapsed] = useState(false);
  const [advanceConfirm, setAdvanceConfirm] = useState(false);
  const [search, setSearch] = useState('');

  const meta = PHASE_META[phase];
  const nextPhase = NEXT_PHASE[phase];
  const total = participants.length || progress.total || 1;
  const submitted = progress.submitted || Object.keys(votes).length;
  const pct = Math.min(100, Math.round((submitted / total) * 100));

  const pendingSet = new Set(pending.map((p) => p.userId));

  // userId → display name for content sub-components
  const participantMap = useMemo(
    () =>
      Object.fromEntries(
        participants.map((p) => [p.userId, p.fullName ?? null]),
      ),
    [participants],
  );

  // Client-side search filter (case-insensitive, matches any part of the name or email)
  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants;
    const q = search.trim().toLowerCase();
    return participants.filter((p) => {
      const name = (p.fullName ?? '').toLowerCase();
      const email = (p.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [participants, search]);

  const handleAdvance = useCallback(() => {
    if (pending.length > 0 && !advanceConfirm) {
      setAdvanceConfirm(true);
      return;
    }
    if (nextPhase === 'finished') socket.emitFinishMeeting();
    else if (nextPhase) socket.emitAdvancePhase(nextPhase);
    setAdvanceConfirm(false);
  }, [pending.length, advanceConfirm, nextPhase, socket]);

  const handleApprove = useCallback(
    (userId: string, approved: boolean) => socket.emitApproveTask(userId, approved),
    [socket],
  );

  const nextLabel = nextPhase
    ? nextPhase === 'finished'
      ? 'Завершить встречу'
      : PHASE_META[nextPhase].label
    : null;

  return (
    <div className="rounded-[24px] overflow-hidden bg-white border border-slate-200 shadow-lg shadow-slate-100/80">

      {/* ── Заголовок ── */}
      <div className={`bg-gradient-to-r ${meta.headerBg} border-b border-slate-200 px-6 py-5`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Слева: индикатор «Live» + название фазы */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${meta.dotColor}`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${meta.dotColor}`} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Панель организатора · Прямой эфир
              </p>
              <h2 className="text-base font-black text-slate-800 leading-tight">{meta.label}</h2>
            </div>
          </div>

          {/* Справа: счётчик + кнопка + свернуть */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-500">
              <span className="text-slate-800 font-black">{submitted}</span>
              {' '}из{' '}
              <span className="text-slate-800 font-black">{total}</span>
              {' '}проголосовали
            </span>

            {nextLabel && (
              <button
                onClick={handleAdvance}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  advanceConfirm
                    ? 'bg-slate-900 hover:bg-black text-white shadow-md shadow-slate-900/20'
                    : nextPhase === 'finished'
                      ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                {advanceConfirm
                  ? `⚠ Подтвердить (${pending.length} не голосовали)`
                  : nextPhase === 'finished'
                    ? '✓ Завершить встречу'
                    : `→ ${nextLabel}`}
              </button>
            )}

            {advanceConfirm && (
              <button
                onClick={() => setAdvanceConfirm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Отмена
              </button>
            )}

            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center transition-colors shadow-sm"
              title={collapsed ? 'Развернуть' : 'Свернуть'}
            >
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mt-4 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${meta.barColor}`}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      {/* ── Тело ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-slate-50/50 space-y-4">

              {/* ── Поиск ── */}
              {participants.length > 1 && (
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4 10.5a7.5 7.5 0 0 0 12.65 6.15z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по имени или email…"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* ── Сетка карточек ── */}
              {participants.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm font-medium">
                  Ожидание участников…
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Никого не найдено по запросу «{search}»
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredParticipants.map((p) => {
                    const vote = votes[p.userId];
                    const isPending = pendingSet.has(p.userId);
                    const approvalState = resolveApproval(taskApprovals[p.userId]);
                    return (
                      <ParticipantCard
                        key={p.userId}
                        participant={p}
                        vote={vote ?? null}
                        phase={phase}
                        isPending={isPending}
                        approvalState={approvalState}
                        accent={meta.accent}
                        participantMap={participantMap}
                        onApprove={handleApprove}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Карточка участника ───────────────────────────────────────────────────────

interface CardProps {
  participant: ActiveParticipant;
  vote: LiveVoteEntry | null;
  phase: MeetingPhase;
  isPending: boolean;
  approvalState: ApprovalState;
  accent: string;
  participantMap: Record<string, string | null>;
  onApprove: (userId: string, approved: boolean) => void;
}

const ParticipantCard: React.FC<CardProps> = ({
  participant,
  vote,
  phase,
  isPending,
  approvalState,
  accent,
  participantMap,
  onApprove,
}) => {
  const displayName = participant.fullName ?? 'Нет данных';
  const initials = displayName === 'Нет данных'
    ? '?'
    : displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const borderClass =
    approvalState === 'approved'
      ? 'border-emerald-200'
      : approvalState === 'rejected'
        ? 'border-red-200'
        : isPending
          ? 'border-blue-200'
        : 'border-slate-200';

  const headerBg =
    approvalState === 'approved'
      ? 'bg-emerald-50'
      : approvalState === 'rejected'
        ? 'bg-red-50'
        : isPending
          ? 'bg-blue-50/60'
        : 'bg-slate-50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border ${borderClass} bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md`}
    >
      {/* Шапка карточки */}
      <div className={`flex items-center gap-3 px-4 py-3 ${headerBg} border-b border-inherit`}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
          style={{ background: accent }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
          {participant.email && (
            <p className="text-[10px] text-slate-400 truncate">{participant.email}</p>
          )}
        </div>
        <StatusBadge isPending={isPending} approvalState={approvalState} hasVote={!!vote} />
      </div>

      {/* Содержимое */}
      <div className="px-4 pb-4 pt-3">
        {vote ? (
          <VoteContent
            userId={participant.userId}
            vote={vote}
            phase={phase}
            approvalState={approvalState}
            participantMap={participantMap}
            onApprove={onApprove}
          />
        ) : (
          <div className="py-3 flex items-center gap-2 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium">Ожидание голоса…</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Значок статуса ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{
  isPending: boolean;
  approvalState: ApprovalState;
  hasVote: boolean;
}> = ({ isPending, approvalState, hasVote }) => {
  if (approvalState === 'approved') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
        ✓ Одобрено
      </span>
    );
  }
  if (approvalState === 'rejected') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">
        ✗ Отклонено
      </span>
    );
  }
  if (!isPending && hasVote) {
    return (
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
    );
  }
  if (isPending) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 whitespace-nowrap">
        Ожидает
      </span>
    );
  }
  return null;
};

// ─── Содержимое голоса (по фазе) ──────────────────────────────────────────────

const VoteContent: React.FC<{
  userId: string;
  vote: LiveVoteEntry;
  phase: MeetingPhase;
  approvalState: ApprovalState;
  participantMap: Record<string, string | null>;
  onApprove: (userId: string, approved: boolean) => void;
}> = ({ userId, vote, phase, approvalState, participantMap, onApprove }) => {
  const time = new Date(vote.updatedAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] text-slate-400 font-medium">обновлено в {time}</p>

      {phase === 'emotional_evaluation' && (
        <EmotionalContent payload={vote.payload} participantMap={participantMap} />
      )}
      {phase === 'understanding_contribution' && (
        <ContributionContent payload={vote.payload} participantMap={participantMap} />
      )}
      {phase === 'task_planning' && (
        <TaskContent
          userId={userId}
          payload={vote.payload}
          approvalState={approvalState}
          onApprove={onApprove}
        />
      )}
      {phase === 'task_evaluation' && (
        <EvaluationContent payload={vote.payload} participantMap={participantMap} />
      )}
      {phase === 'retrospective' && (
        <p className="text-xs text-slate-400 italic">Ретроспектива в процессе…</p>
      )}
    </div>
  );
};

// ─── Фаза 1 — Обсуждение ──────────────────────────────────────────────────────

const EmotionalContent: React.FC<{
  payload: Record<string, unknown>;
  participantMap: Record<string, string | null>;
}> = ({ payload, participantMap }) => {
  const evals = (payload.evaluations ?? []) as Array<{
    targetParticipantId: string;
    isToxic: boolean;
  }>;

  if (evals.length === 0) {
    return <p className="text-xs text-slate-400 italic">Нет данных</p>;
  }

  return (
    <div className="space-y-2">
      {evals.map((e) => {
        const name = participantMap[e.targetParticipantId] ?? 'Нет данных';
        return (
          <div key={e.targetParticipantId} className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-700 font-medium truncate flex-1">{name}</span>
            {e.isToxic ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap flex-shrink-0">
                Токсичен
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap flex-shrink-0">
                Норм
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Фаза 2 — Вклад участников ────────────────────────────────────────────────

const ContributionContent: React.FC<{
  payload: Record<string, unknown>;
  participantMap: Record<string, string | null>;
}> = ({ payload, participantMap }) => {
  const score = payload.understandingScore as number | undefined;
  const contribs = (payload.contributions ?? []) as Array<{
    participantId: string;
    contributionPercentage: number;
  }>;

  return (
    <div className="space-y-2.5">
      {score !== undefined && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500">Понимание задачи</span>
            <span className="text-xs font-black text-blue-600">{score}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
        </div>
      )}

      {contribs.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Вклад</p>
          {contribs.map((c) => {
            const name = participantMap[c.participantId] ?? 'Нет данных';
            return (
              <div key={c.participantId} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-700 flex-1 truncate font-medium">{name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${c.contributionPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 w-7 text-right tabular-nums">
                    {c.contributionPercentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Фаза 3 — Планирование задач ──────────────────────────────────────────────
//
// Правила одобрения:
//   pending  → [Одобрить]                       (Отклонить недоступно)
//   approved → "✓ Одобрено"  + [Отклонить]
//   rejected → "✗ Отклонено" + [Одобрить снова]

const TaskContent: React.FC<{
  userId: string;
  payload: Record<string, unknown>;
  approvalState: ApprovalState;
  onApprove: (userId: string, approved: boolean) => void;
}> = ({ userId, payload, approvalState, onApprove }) => {
  const desc = payload.taskDescription as string | undefined;
  const common = payload.commonQuestion as string | undefined;
  const hours = payload.estimateHours as number | undefined;
  const contrib = payload.expectedContributionPercentage as number | undefined;

  const deadline = (() => {
    if (!payload.deadline) return null;
    try {
      const d = new Date(payload.deadline as string);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    } catch { return null; }
  })();

  return (
    <div className="space-y-3">
      {desc ? (
        <p className="text-sm text-slate-800 font-semibold leading-snug">{desc}</p>
      ) : (
        <p className="text-xs text-slate-400 italic">Участник ещё заполняет форму…</p>
      )}

      {common && (
        <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-300 pl-2 leading-snug">
          «{common}»
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {deadline && <MetaChip icon="📅">{deadline}</MetaChip>}
        {hours !== undefined && hours > 0 && <MetaChip icon="⏱">{hours} ч.</MetaChip>}
        {contrib !== undefined && contrib > 0 && <MetaChip icon="📊">{contrib}%</MetaChip>}
      </div>

      {/* ── Кнопки одобрения ── */}
      {approvalState === 'pending' && (
        // Только «Одобрить» — отклонить нельзя без предварительного одобрения
        <button
          onClick={() => onApprove(userId, true)}
          className="w-full rounded-xl py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-[0.97]"
        >
          ✓ Одобрить задачу
        </button>
      )}

      {approvalState === 'approved' && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Одобрено
          </span>
          <button
            onClick={() => onApprove(userId, false)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-[0.97]"
          >
            Отклонить
          </button>
        </div>
      )}

      {approvalState === 'rejected' && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
            ✗ Отклонено
          </span>
          <button
            onClick={() => onApprove(userId, true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-[0.97]"
          >
            Одобрить снова
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Фаза 4 — Оценка задач ────────────────────────────────────────────────────

const EvaluationContent: React.FC<{
  payload: Record<string, unknown>;
  participantMap: Record<string, string | null>;
}> = ({ payload, participantMap }) => {
  const evals = (payload.evaluations ?? []) as Array<{
    taskAuthorId: string;
    importanceScore: number;
  }>;

  if (evals.length === 0) {
    return <p className="text-xs text-slate-400 italic">Нет данных</p>;
  }

  return (
    <div className="space-y-1.5">
      {evals.map((e) => {
        const name = participantMap[e.taskAuthorId] ?? 'Нет данных';
        return (
          <div key={e.taskAuthorId} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-700 flex-1 truncate font-medium">{name}</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-500"
                style={{ width: `${e.importanceScore}%` }}
              />
            </div>
            <span className="text-xs font-black text-blue-600 w-7 text-right tabular-nums">
              {e.importanceScore}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Мета-чип ─────────────────────────────────────────────────────────────────

const MetaChip: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
    <span>{icon}</span>
    {children}
  </span>
);
