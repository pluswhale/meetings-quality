import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useMeetingStore,
  selectRetroTasks,
  selectRetroStatuses,
  selectParticipants,
} from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from '../hooks/useMeetingSocket';

interface Props {
  socket: UseMeetingSocketReturn;
  isCreator: boolean;
}

export const RetroPhaseView: React.FC<Props> = ({ socket, isCreator }) => {
  const retroTasks = useMeetingStore(selectRetroTasks);
  const retroStatuses = useMeetingStore(selectRetroStatuses);
  const participants = useMeetingStore(selectParticipants);

  // Build a map for quick author name lookup: userId → fullName
  const authorMap = React.useMemo(
    () => Object.fromEntries(participants.map((p) => [p.userId, p.fullName ?? 'Участник'])),
    [participants],
  );

  const allDone =
    retroTasks.length > 0 && retroTasks.every((t) => t._id in retroStatuses);

  if (isCreator) {
    return (
      <CreatorRetroView
        retroTasks={retroTasks}
        retroStatuses={retroStatuses}
        participants={participants}
        authorMap={authorMap}
        socket={socket}
        allDone={allDone}
      />
    );
  }

  return (
    <ParticipantRetroView
      tasks={retroTasks}
      statuses={retroStatuses}
      authorMap={authorMap}
      socket={socket}
    />
  );
};

// ─── Participant view ──────────────────────────────────────────────────────────

interface ParticipantRetroProps {
  tasks: ReturnType<typeof selectRetroTasks>;
  statuses: ReturnType<typeof selectRetroStatuses>;
  authorMap: Record<string, string>;
  socket: UseMeetingSocketReturn;
}

const ParticipantRetroView: React.FC<ParticipantRetroProps> = ({
  tasks,
  statuses,
  authorMap,
  socket,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-lg font-bold text-slate-700">Нет задач для ретроспективы</p>
        <p className="text-sm text-slate-500 mt-1">
          Ожидайте, пока организатор начнёт первую фазу.
        </p>
      </div>
    );
  }

  const completedCount = Object.keys(statuses).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Фаза 0 · Ретроспектива
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Обзор предыдущих задач</h2>
            <p className="text-sm text-slate-500 mt-1">
              Отметьте статус каждой задачи, которую вы взяли на себя в прошлой встрече.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-black text-blue-600">{completedCount}</p>
            <p className="text-xs text-slate-400">из {tasks.length} проверено</p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-600"
            animate={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <RetroTaskCard
            key={task._id}
            task={task}
            authorName={authorMap[task.authorId] ?? 'Участник'}
            status={statuses[task._id]}
            onSubmit={socket.emitRetroStatus}
          />
        ))}
      </div>

      {completedCount === tasks.length && tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3"
        >
          <span className="text-green-600 text-xl">✓</span>
          <p className="text-sm font-semibold text-green-700">
            Все задачи проверены. Ожидайте начала следующей фазы от организатора.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Single task card ──────────────────────────────────────────────────────────

interface RetroTaskCardProps {
  task: ReturnType<typeof selectRetroTasks>[0];
  authorName: string;
  status: ReturnType<typeof selectRetroStatuses>[string] | undefined;
  onSubmit: UseMeetingSocketReturn['emitRetroStatus'];
}

const RetroTaskCard: React.FC<RetroTaskCardProps> = ({ task, authorName, status, onSubmit }) => {
  const [note, setNote] = useState(status?.statusNote ?? '');
  const [pending, setPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasStatus = Boolean(status);
  const showForm = !hasStatus || isEditing;
  const isCompleted = status?.status === 'completed';

  const handleMark = (taskStatus: 'completed' | 'incomplete') => {
    setPending(true);
    onSubmit(task._id, taskStatus, note || undefined);
    setIsEditing(false);
    setTimeout(() => setPending(false), 600);
  };

  const deadline = (() => {
    try {
      return new Date(task.deadline).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  })();

  return (
    <motion.div
      layout
      className={`rounded-2xl border p-5 transition-all bg-white ${
        hasStatus && !isEditing ? 'border-slate-200 opacity-80' : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-snug">{task.description}</p>
          {task.commonQuestion && (
            <p className="text-xs text-slate-500 mt-1 italic">«{task.commonQuestion}»</p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400 font-medium">
            <span>👤 {authorName}</span>
            <span>📅 {deadline}</span>
            {task.estimateHours > 0 && <span>⏱ {task.estimateHours} ч.</span>}
            {task.contributionImportance > 0 && <span>📊 {task.contributionImportance}%</span>}
          </div>
        </div>

        {hasStatus && !isEditing && (
          <span
            className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${
              isCompleted
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            {isCompleted ? '✓ Выполнено' : '✗ Не выполнено'}
          </span>
        )}
      </div>

      {hasStatus && !isEditing && status?.statusNote && (
        <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2">
          «{status.statusNote}»
        </p>
      )}

      {showForm && (
        <div className="mt-4 space-y-2.5">
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={2}
            placeholder="Необязательно: добавьте комментарий…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleMark('completed')}
              disabled={pending}
              className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 transition-colors disabled:opacity-50"
            >
              ✓ Выполнено
            </button>
            <button
              onClick={() => handleMark('incomplete')}
              disabled={pending}
              className="flex-1 rounded-xl bg-red-400 hover:bg-red-500 text-white text-xs font-bold py-2 transition-colors disabled:opacity-50"
            >
              ✗ Не выполнено
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-3 text-xs text-slate-500 hover:bg-slate-100 border border-slate-200"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      )}

      {hasStatus && !isEditing && (
        <button
          onClick={() => { setNote(status?.statusNote ?? ''); setIsEditing(true); }}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Изменить ответ
        </button>
      )}
    </motion.div>
  );
};

// ─── Creator view ──────────────────────────────────────────────────────────────

interface CreatorRetroViewProps {
  retroTasks: ReturnType<typeof selectRetroTasks>;
  retroStatuses: ReturnType<typeof selectRetroStatuses>;
  participants: ReturnType<typeof selectParticipants>;
  authorMap: Record<string, string>;
  socket: UseMeetingSocketReturn;
  allDone: boolean;
}

const CreatorRetroView: React.FC<CreatorRetroViewProps> = ({
  retroTasks,
  retroStatuses,
  participants,
  authorMap,
  socket,
  allDone,
}) => {
  // Group tasks by authorId for participant-level progress
  const tasksByAuthor = React.useMemo(() => {
    const map: Record<string, typeof retroTasks> = {};
    for (const t of retroTasks) {
      if (!map[t.authorId]) map[t.authorId] = [];
      map[t.authorId].push(t);
    }
    return map;
  }, [retroTasks]);

  const participantProgress = participants.map((p) => {
    const tasks = tasksByAuthor[p.userId] ?? [];
    const reviewed = tasks.filter((t) => t._id in retroStatuses).length;
    return { participant: p, total: tasks.length, reviewed };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
          Фаза 0 · Ретроспектива
        </span>
        <h2 className="text-xl font-black text-slate-900 mt-1">Прогресс участников</h2>
        <p className="text-sm text-slate-500 mt-1">
          Участники проверяют задачи из предыдущей встречи.
        </p>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3"
        >
          <span className="text-green-600 text-xl">✓</span>
          <p className="text-sm font-semibold text-green-700">
            Все участники завершили ретроспективу. Можно переходить к фазе 1.
          </p>
        </motion.div>
      )}

      {/* Participant progress cards */}
      <div className="grid gap-3">
        {participantProgress.map(({ participant, total, reviewed }) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-slate-800">
                {participant.fullName ?? participant.email ?? 'Участник'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Проверено задач: {reviewed} из {total}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                total === 0
                  ? 'bg-slate-100 text-slate-400'
                  : reviewed === total
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
              }`}
            >
              {total === 0 ? 'Нет задач' : reviewed === total ? '✓ Готово' : 'В процессе'}
            </span>
          </div>
        ))}
      </div>

      {/* All tasks overview */}
      {retroTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider">
            Все задачи
          </h3>
          {retroTasks.map((task) => {
            const status = retroStatuses[task._id];
            const name = authorMap[task.authorId] ?? 'Участник';
            return (
              <div
                key={task._id}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {task.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">👤 {name}</p>
                  </div>
                  {status ? (
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        status.status === 'completed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-600 border border-red-200'
                      }`}
                    >
                      {status.status === 'completed' ? '✓ Выполнено' : '✗ Не выполнено'}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 whitespace-nowrap">
                      Ожидает
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advance button */}
      <button
        onClick={() => socket.emitAdvancePhase('emotional_evaluation')}
        className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-colors ${
          allDone
            ? 'bg-slate-900 hover:bg-black text-white shadow-sm'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }`}
      >
        {allDone ? 'Перейти к фазе 1 →' : 'Перейти к фазе 1 (часть участников ещё не завершила)'}
      </button>
    </motion.div>
  );
};
