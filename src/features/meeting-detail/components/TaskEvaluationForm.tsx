/**
 * TaskEvaluationForm — Phase 4. Rate each persisted task except your own.
 */

import React from 'react';
import { Slider } from '@/src/shared/ui';
import type { EvaluableTask } from '../state/meetingDetail.types';

interface TaskEvaluationFormProps {
  tasks: EvaluableTask[];
  scores: Record<string, number>;
  onScoreChange: (taskId: string, score: number) => void;
  onScoreCommit: (taskId: string, score: number) => void;
}

export const TaskEvaluationForm: React.FC<TaskEvaluationFormProps> = ({
  tasks,
  scores,
  onScoreChange,
  onScoreCommit,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        Оценка задач
        <div className="h-px bg-slate-200 flex-1" />
      </h2>

      {tasks.length === 0 ? (
        <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-lg shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">
            Нет чужих задач для оценки — вы автор всех задач этой встречи, либо задачи ещё не
            созданы.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => {
            const score = scores[task._id] ?? 50;
            return (
              <div
                key={task._id}
                className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100 space-y-5"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                    {task.authorName}
                  </p>
                  <p className="text-lg font-black text-slate-900">{task.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Важность задачи
                  </label>
                  <span className="text-2xl font-black tabular-nums text-purple-600">{score}%</span>
                </div>
                <Slider
                  value={score}
                  onChange={(v) => onScoreChange(task._id, v)}
                  onChangeEnd={(v) => onScoreCommit(task._id, v)}
                  variant="importance"
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
