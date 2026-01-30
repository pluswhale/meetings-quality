/**
 * FinishedPhaseView – Full Meeting Overview
 * Displays full finished meeting info in a clean, readable UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/src/shared/lib';

interface FinishedPhaseViewProps {
  meeting: any;
  onBack: () => void;
}

export function FinishedPhaseView({ meeting, onBack }: FinishedPhaseViewProps) {
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
          <span className="text-slate-400 text-sm">
            {formatDate(meeting.createdAt)}
          </span>
        </div>

        <h1 className="text-4xl font-black text-slate-900">
          {meeting.title}
        </h1>

        <p className="text-lg text-slate-600">
          {meeting.question}
        </p>
      </header>

      {/* Emotional Evaluations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black">Эмоциональные оценки</h2>

        {meeting.emotionalEvaluations.map((ev: any) => (
          <div
            key={ev.participant._id}
            className="p-6 bg-white rounded-3xl border space-y-4"
          >
            <div className="text-sm text-slate-500">
              Оценки от участника
            </div>

            <UserBadge user={ev.participant} />

            <div className="space-y-2">
              {ev.evaluations.map((e: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-slate-700">
                    → {meeting.participantIds.find(
                      (p: any) => p._id === e.targetParticipantId
                    )?.fullName || 'Участник'}
                  </span>

                  <div className="flex items-center gap-4">
                    <Score value={e.emotionalScale} />
                    {e.isToxic && (
                      <span className="px-2 py-1 text-[10px] font-black uppercase rounded-full bg-red-100 text-red-600">
                        toxic
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Understanding & Contribution */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black">Понимание и вклад</h2>

        {meeting.understandingContributions.map((uc: any) => (
          <div
            key={uc.participant._id}
            className="p-6 bg-white rounded-3xl border space-y-4"
          >
            <div className="flex items-center justify-between">
              <UserBadge user={uc.participant} />
              <span className="text-2xl font-black text-blue-600">
                {uc.understandingScore}%
              </span>
            </div>

            <div className="space-y-2">
              {uc.contributions.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-slate-600"
                >
                  <span>
                    {meeting.participantIds.find(
                      (p: any) => p._id === c.participantId
                    )?.fullName}
                  </span>
                  <span>{c.contributionPercentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Tasks */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black">Задачи</h2>

        {meeting.taskPlannings.map((task: any, idx: number) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-3xl border space-y-3"
          >
            <UserBadge user={task.participant} />

            <div className="font-semibold text-slate-900">
              {task.taskDescription}
            </div>

            <p className="text-sm text-slate-600">
              {task.commonQuestion}
            </p>

            <div className="flex justify-between text-xs text-slate-400">
              <span>Дедлайн: {formatDate(task.deadline)}</span>
              <span>Ожидание: {task.expectedContributionPercentage}%</span>
            </div>
          </div>
        ))}
      </section>

      {/* Task Evaluations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black">Оценка задач</h2>

        {meeting.taskEvaluations.map((te: any) => (
          <div
            key={te.participant._id}
            className="p-6 bg-white rounded-3xl border space-y-3"
          >
            <UserBadge user={te.participant} />

            {te.evaluations.map((e: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between text-sm"
              >
                <span>
                  {
                    meeting.participantIds.find(
                      (p: any) => p._id === e.taskAuthorId
                    )?.fullName
                  }
                </span>
                <span className="font-black">{e.importanceScore}%</span>
              </div>
            ))}
          </div>
        ))}
      </section>
    </motion.div>
  );
}

const UserBadge = ({ user }: { user: any }) => (
  <div className="flex flex-col">
    <span className="font-semibold text-slate-900">{user.fullName}</span>
    <span className="text-xs text-slate-400">{user.email}</span>
  </div>
);

const Score = ({ value }: { value: number }) => (
  <span
    className={`font-black tabular-nums ${
      value >= 0 ? 'text-green-600' : 'text-red-600'
    }`}
  >
    {value}
  </span>
);

