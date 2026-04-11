/**
 * FinishedPhaseView – Итоги завершённой встречи.
 *
 * Если пользователь — организатор, показывает CTA "Создать следующую встречу",
 * которая создаёт новую встречу с previousMeetingId = текущей встрече.
 * Новая встреча автоматически начинается с Phase 0 (Ретроспектива).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/src/shared/lib';
import { useMeetingsControllerCreate } from '@/src/shared/api/generated/meetings/meetings';

interface FinishedPhaseViewProps {
  meeting: any;
  meetingId: string;
  isCreator: boolean;
  onBack: () => void;
}

export function FinishedPhaseView({
  meeting,
  meetingId,
  isCreator,
  onBack,
}: FinishedPhaseViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 md:p-12 space-y-16"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"
      >
        ← Назад
      </button>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black uppercase">
            Завершено
          </span>
          <span className="text-slate-400 text-sm">{formatDate(meeting.createdAt)}</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900">{meeting.title}</h1>
        <p className="text-lg text-slate-600">{meeting.question}</p>
      </header>

      {/* ── Create Next Meeting CTA (creator only) ── */}
      {isCreator && (
        <CreateNextMeetingSection
          currentMeetingId={meetingId}
          currentTitle={meeting.title}
          participants={meeting.participantIds ?? []}
          projectId={meeting.projectId ?? meeting.project?._id ?? meeting.project ?? ''}
        />
      )}

      {/* ── Analytics Dashboard ── */}
      <AnalyticsDashboard meeting={meeting} />

      {/* Emotional Evaluations */}
      {meeting.emotionalEvaluations?.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Эмоциональные оценки</h2>
          {meeting.emotionalEvaluations.map((ev: any) => (
            <div
              key={ev.participant?._id ?? ev.participantId}
              className="p-6 bg-white rounded-3xl border space-y-4"
            >
              <div className="text-sm text-slate-500">Оценки от участника</div>
              <UserBadge user={ev.participant} />
              <div className="space-y-2">
                {ev.evaluations.map((e: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm text-slate-700">
                      →{' '}
                      {meeting.participantIds?.find(
                        (p: any) => (p._id ?? p) === e.targetParticipantId,
                      )?.fullName ?? 'Участник'}
                    </span>
                    <div className="flex items-center gap-4">
                      {e.isToxic && (
                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded-full bg-red-100 text-red-600">
                          Токсичен
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Understanding & Contribution */}
      {meeting.understandingContributions?.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Понимание и вклад</h2>
          {meeting.understandingContributions.map((uc: any) => (
            <div
              key={uc.participant?._id ?? uc.participantId}
              className="p-6 bg-white rounded-3xl border space-y-4"
            >
              <div className="flex items-center justify-between">
                <UserBadge user={uc.participant} />
                <span className="text-2xl font-black text-blue-600">{uc.understandingScore}%</span>
              </div>
              <div className="space-y-2">
                {uc.contributions?.map((c: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-600">
                    <span>
                      {meeting.participantIds?.find((p: any) => (p._id ?? p) === c.participantId)
                        ?.fullName ?? 'Участник'}
                    </span>
                    <span>{c.contributionPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Tasks */}
      {meeting.taskPlannings?.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Задачи</h2>
          {meeting.taskPlannings.map((task: any, idx: number) => (
            <div key={idx} className="p-6 bg-white rounded-3xl border space-y-3">
              <UserBadge user={task.participant} />
              <div className="font-semibold text-slate-900">{task.taskDescription}</div>
              {task.commonQuestion && (
                <p className="text-sm text-slate-600 italic">«{task.commonQuestion}»</p>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                {task.deadline && <span>Дедлайн: {formatDate(task.deadline)}</span>}
                {task.expectedContributionPercentage > 0 && (
                  <span>Вклад: {task.expectedContributionPercentage}%</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Task Evaluations */}
      {meeting.taskEvaluations?.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Оценка задач</h2>
          {meeting.taskEvaluations.map((te: any) => (
            <div
              key={te.participant?._id ?? te.participantId}
              className="p-6 bg-white rounded-3xl border space-y-3"
            >
              <UserBadge user={te.participant} />
              {te.evaluations?.map((e: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {meeting.participantIds?.find((p: any) => (p._id ?? p) === e.taskAuthorId)
                      ?.fullName ?? 'Участник'}
                  </span>
                  <span className="font-black">{e.importanceScore}%</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
    </motion.div>
  );
}

// ─── Create Next Meeting Section ──────────────────────────────────────────────

interface CreateNextMeetingSectionProps {
  currentMeetingId: string;
  currentTitle: string;
  participants: Array<{ _id: string; fullName?: string; email?: string } | string>;
  /** projectId of the current meeting — forwarded to the new meeting (required by backend) */
  projectId: string;
}

const CreateNextMeetingSection: React.FC<CreateNextMeetingSectionProps> = ({
  currentMeetingId,
  currentTitle,
  participants,
  projectId,
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(`${currentTitle} — продолжение`);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  // Carry over all participant IDs from the current meeting
  const participantIds = participants
    .map((p) => (typeof p === 'string' ? p : p._id))
    .filter(Boolean);

  const handleCreate = () => {
    if (!title.trim() || !question.trim()) return;
    if (!projectId) {
      setError('Не удалось определить проект. Попробуйте создать встречу со страницы проекта.');
      return;
    }
    setError('');

    createMeeting(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          title: title.trim(),
          question: question.trim(),
          participantIds,
          previousMeetingId: currentMeetingId,
          projectId,
          upcomingDate: new Date().toISOString(),
        } as any,
      },
      {
        onSuccess: (data) => {
          navigate(`/meeting/${data._id}`);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string | string[] } } })
              ?.response?.data?.message;
          setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Ошибка создания встречи'));
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] overflow-hidden bg-white border border-slate-200 shadow-sm"
    >
      {/* Always-visible CTA */}
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              Следующий шаг
            </p>
            <h3 className="text-base font-black text-slate-800">Создать следующую встречу</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Задачи этой встречи появятся в Phase 0 (Ретроспектива) новой встречи.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold transition-colors shadow-sm"
        >
          {expanded ? 'Свернуть' : 'Создать →'}
        </button>
      </div>

      {/* Expandable form */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
              {/* Participants summary */}
              <p className="text-xs text-slate-500 font-medium">
                Участники ({participants.length}) перенесутся автоматически.
              </p>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Тема встречи</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Название новой встречи"
                />
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Главный вопрос
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  placeholder="Какой основной результат мы должны получить?"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium bg-red-50 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleCreate}
                disabled={isPending || !title.trim() || !question.trim()}
                className="w-full rounded-xl py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isPending ? 'Создание…' : '🚀 Создать и открыть следующую встречу'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Analytics Dashboard ──────────────────────────────────────────────────────

const AnalyticsDashboard: React.FC<{ meeting: any }> = ({ meeting }) => {
  // ── Task stats ───────────────────────────────────────────────────────────
  const tasks: any[] = meeting.taskPlannings ?? [];
  const approved = tasks.filter((t) => t.approved === true).length;
  const rejected = tasks.filter((t) => t.approved === false).length;
  const approvalRate = tasks.length > 0 ? Math.round((approved / tasks.length) * 100) : 0;

  // ── Toxicity summary ────────────────────────────────────────────────────
  // Build map: participantName → how many people marked them toxic
  const toxicCounts: Record<string, number> = {};
  const participantNames: Record<string, string> = {};

  (meeting.participantIds ?? []).forEach((p: any) => {
    if (p && typeof p === 'object') {
      participantNames[p._id] = p.fullName ?? 'Участник';
    }
  });

  (meeting.emotionalEvaluations ?? []).forEach((ev: any) => {
    (ev.evaluations ?? []).forEach((e: any) => {
      if (e.isToxic) {
        const name =
          participantNames[e.targetParticipantId] ?? e.targetParticipantId?.slice(-6) ?? '?';
        toxicCounts[name] = (toxicCounts[name] ?? 0) + 1;
      }
    });
  });
  const toxicEntries = Object.entries(toxicCounts).sort((a, b) => b[1] - a[1]);
  const maxToxic = toxicEntries[0]?.[1] ?? 1;

  // ── Contribution distribution ────────────────────────────────────────────
  // Average contribution % per participant across all raters
  const contribSum: Record<string, number> = {};
  const contribCount: Record<string, number> = {};
  (meeting.understandingContributions ?? []).forEach((uc: any) => {
    (uc.contributions ?? []).forEach((c: any) => {
      const name = participantNames[c.participantId] ?? c.participantId?.slice(-6) ?? '?';
      contribSum[name] = (contribSum[name] ?? 0) + (c.contributionPercentage ?? 0);
      contribCount[name] = (contribCount[name] ?? 0) + 1;
    });
  });
  const contribEntries = Object.entries(contribSum)
    .map(([name, sum]) => ({ name, avg: Math.round(sum / (contribCount[name] ?? 1)) }))
    .sort((a, b) => b.avg - a.avg);
  const maxContrib = contribEntries[0]?.avg ?? 1;

  // ── Understanding scores ─────────────────────────────────────────────────
  const understandingEntries = (meeting.understandingContributions ?? [])
    .map((uc: any) => ({
      name:
        uc.participant?.fullName ?? participantNames[(uc.participant as any)?._id] ?? 'Участник',
      score: uc.understandingScore ?? 0,
    }))
    .sort((a: any, b: any) => b.score - a.score);

  const hasAnyData =
    tasks.length > 0 ||
    toxicEntries.length > 0 ||
    contribEntries.length > 0 ||
    understandingEntries.length > 0;

  if (!hasAnyData) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-black text-slate-900">Аналитика встречи</h2>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Task stats card */}
        {tasks.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Задачи</h3>
            </div>
            <div className="flex items-end gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-green-600">{approved}</p>
                <p className="text-xs text-slate-500 mt-0.5">одобрено</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-red-500">{rejected}</p>
                <p className="text-xs text-slate-500 mt-0.5">отклонено</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-400">
                  {tasks.length - approved - rejected}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">ожидает</p>
              </div>
            </div>
            {/* Approval bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Процент одобрения</span>
                <span className="font-bold">{approvalRate}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${approvalRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toxicity card */}
        {toxicEntries.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                Токсичность
              </h3>
            </div>
            <div className="space-y-2.5">
              {toxicEntries.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate">{name}</span>
                    <span className="text-red-500 font-bold ml-2">{count}×</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxToxic) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-6 flex items-center gap-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm font-black text-green-800">Токсичных меток нет</p>
              <p className="text-xs text-green-600 mt-0.5">
                Ни один участник не был отмечен как токсичный.
              </p>
            </div>
          </div>
        )}

        {/* Contribution distribution */}
        {contribEntries.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                Вклад участников (среднее)
              </h3>
            </div>
            <div className="space-y-2.5">
              {contribEntries.map(({ name, avg }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-36 text-xs font-medium text-slate-700 truncate">{name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(avg / maxContrib) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-bold text-blue-600">{avg}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Understanding scores */}
        {understandingEntries.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                Понимание встречи
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {understandingEntries.map((entry: any) => (
                <div
                  key={entry.name}
                  className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <p
                    className={`text-2xl font-black ${
                      entry.score >= 70
                        ? 'text-green-600'
                        : entry.score >= 40
                          ? 'text-blue-500'
                          : 'text-red-500'
                    }`}
                  >
                    {entry.score}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate" title={entry.name}>
                    {entry.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UserBadge = ({ user }: { user: any }) => {
  if (!user) return null;
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-slate-900">{user.fullName ?? 'Участник'}</span>
      {user.email && <span className="text-xs text-slate-400">{user.email}</span>}
    </div>
  );
};
