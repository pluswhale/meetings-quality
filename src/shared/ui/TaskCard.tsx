import React from 'react';
import { motion } from 'framer-motion';

export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'incomplete';

export interface TaskCardData {
  id: string;
  title: string;
  description?: string;
  ownerName?: string;
  ownerInitials?: string;
  deadline?: string | Date | null;
  status?: TaskStatus;
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  completionStatus?: 'completed' | 'incomplete' | null;
  estimatedHours?: number;
  contributionPct?: number;
  importanceScore?: number;
}

interface TaskCardProps {
  task: TaskCardData;
  onApprove?: () => void;
  onReject?: () => void;
  showApprovalActions?: boolean;
  compact?: boolean;
  className?: string;
}

const deadlineUrgency = (deadline: string | Date | null | undefined): 'overdue' | 'urgent' | 'soon' | 'normal' | null => {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return 'overdue';
  if (days <= 1) return 'urgent';
  if (days <= 3) return 'soon';
  return 'normal';
};

const urgencyStyles = {
  overdue: 'text-mq-danger bg-mq-danger-soft',
  urgent:  'text-orange-600 bg-orange-50',
  soon:    'text-mq-warning bg-mq-warning-soft',
  normal:  'text-mq-muted bg-slate-50',
};

const urgencyIcons = {
  overdue: '⚠️',
  urgent:  '🔴',
  soon:    '🟡',
  normal:  '📅',
};

const formatDeadline = (d: string | Date): string => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const approvalBadge: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Одобрено',  cls: 'bg-mq-success-soft text-emerald-700' },
  rejected: { label: 'Отклонено', cls: 'bg-mq-danger-soft text-rose-700' },
  pending:  { label: 'На рассмотрении', cls: 'bg-mq-warning-soft text-amber-700' },
};

const completionBadge: Record<string, { label: string; cls: string }> = {
  completed:  { label: 'Выполнено',   cls: 'bg-mq-success-soft text-emerald-700' },
  incomplete: { label: 'Не выполнено', cls: 'bg-slate-100 text-slate-600' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onApprove,
  onReject,
  showApprovalActions = false,
  compact = false,
  className = '',
}) => {
  const urgency = deadlineUrgency(task.deadline);
  const approval = task.approvalStatus ? approvalBadge[task.approvalStatus] : null;
  const completion = task.completionStatus ? completionBadge[task.completionStatus] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'group bg-white rounded-2xl border border-mq-border shadow-glass',
        'card-lift overflow-hidden',
        compact ? 'p-4' : 'p-5',
        className,
      ].join(' ')}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Owner Avatar */}
          {task.ownerInitials && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {task.ownerInitials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mq-text truncate leading-tight">
              {task.title}
            </p>
            {task.ownerName && (
              <p className="text-xs text-mq-muted mt-0.5 truncate">{task.ownerName}</p>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {approval && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${approval.cls}`}>
              {approval.label}
            </span>
          )}
          {completion && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${completion.cls}`}>
              {completion.label}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-sm text-mq-secondary leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Deadline */}
        {task.deadline && urgency && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg ${urgencyStyles[urgency]}`}>
            <span>{urgencyIcons[urgency]}</span>
            {formatDeadline(task.deadline)}
          </span>
        )}

        {/* Hours */}
        {task.estimatedHours != null && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mq-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {task.estimatedHours}ч
          </span>
        )}

        {/* Contribution */}
        {task.contributionPct != null && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mq-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {task.contributionPct}%
          </span>
        )}

        {/* Importance */}
        {task.importanceScore != null && (
          <span className="inline-flex items-center gap-1 text-[11px] text-mq-muted">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {task.importanceScore}/10
          </span>
        )}
      </div>

      {/* Approval Actions */}
      {showApprovalActions && !task.approvalStatus && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-mq-border">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-mq-success-soft text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Одобрить
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-mq-danger-soft text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Отклонить
          </motion.button>
        </div>
      )}

      {/* Already approved/rejected indicator */}
      {showApprovalActions && task.approvalStatus && task.approvalStatus !== 'pending' && (
        <div className="flex justify-end mt-3 pt-3 border-t border-mq-border">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${approvalBadge[task.approvalStatus]?.cls}`}>
            {approvalBadge[task.approvalStatus]?.label}
          </span>
        </div>
      )}
    </motion.div>
  );
};

interface TaskListProps {
  tasks: TaskCardData[];
  emptyLabel?: string;
  showApprovalActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  compact?: boolean;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyLabel = 'Задачи не найдены',
  showApprovalActions = false,
  onApprove,
  onReject,
  compact = false,
  className = '',
}) => {
  if (tasks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p className="text-sm text-mq-muted font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          compact={compact}
          showApprovalActions={showApprovalActions}
          onApprove={onApprove ? () => onApprove(task.id) : undefined}
          onReject={onReject ? () => onReject(task.id) : undefined}
        />
      ))}
    </div>
  );
};
