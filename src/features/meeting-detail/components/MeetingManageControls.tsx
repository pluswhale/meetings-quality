/**
 * MeetingManageControls — creator-only controls below the meeting header:
 *   1. «Участники» — inline editor for the meeting's participant list.
 *   2. «Дата и время» — reschedule the meeting.
 *   3. «Удалить встречу» — two-step confirm destructive action.
 *
 * MeetingResponseDto.participantIds is a plain string[] of user ids, so
 * display names are resolved via useUsersControllerFindAll.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { MeetingResponseDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import {
  useMeetingsControllerUpdate,
  useMeetingsControllerRemove,
  getMeetingsControllerFindAllQueryKey,
} from '@/src/shared/api/generated/meetings/meetings';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import { DateTimePicker, Input } from '@/src/shared/ui';
import { formatDate, formatTime } from '@/src/shared/lib';
import { meetingDetailQueryKeys } from '../hooks/queryKeys';

interface MeetingManageControlsProps {
  meeting: MeetingResponseDto;
}

export const MeetingManageControls: React.FC<MeetingManageControlsProps> = ({ meeting }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creatorId = meeting.creatorId._id;

  const [editorOpen, setEditorOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const storedDate = useMemo(() => {
    if (!meeting.upcomingDate) return null;
    const parsed = new Date(meeting.upcomingDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, [meeting.upcomingDate]);

  const [scheduledAt, setScheduledAt] = useState<Date | null>(storedDate);

  // Re-sync when the meeting is rescheduled elsewhere (another tab, or the
  // meetingUpdated socket event refetching the document).
  useEffect(() => {
    setScheduledAt(storedDate);
  }, [storedDate]);

  // Local editable selection — creator is always included and cannot be removed.
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...new Set([creatorId, ...meeting.participantIds]),
  ]);

  useEffect(() => {
    setSelectedIds([...new Set([creatorId, ...meeting.participantIds])]);
  }, [creatorId, meeting.participantIds]);

  const { data: allUsers = [] } = useUsersControllerFindAll({
    query: { enabled: editorOpen },
  });

  const { mutate: updateMeeting, isPending: isSaving } = useMeetingsControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: meetingDetailQueryKeys.meeting(meeting._id),
        });
        queryClient.invalidateQueries({ queryKey: getMeetingsControllerFindAllQueryKey() });
        toast.success('Участники обновлены');
        setEditorOpen(false);
      },
      onError: () => {
        toast.error('Не удалось обновить участников');
      },
    },
  });

  // A separate instance of the same mutation so the success/error toasts
  // describe rescheduling rather than the participant list.
  const { mutate: rescheduleMeeting, isPending: isRescheduling } = useMeetingsControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: meetingDetailQueryKeys.meeting(meeting._id),
        });
        queryClient.invalidateQueries({ queryKey: getMeetingsControllerFindAllQueryKey() });
        toast.success('Дата и время встречи обновлены');
        setScheduleOpen(false);
      },
      onError: () => {
        toast.error('Не удалось изменить дату и время');
      },
    },
  });

  const { mutate: deleteMeeting, isPending: isDeleting } = useMeetingsControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getMeetingsControllerFindAllQueryKey() });
        queryClient.invalidateQueries({
          queryKey: meetingDetailQueryKeys.meeting(meeting._id),
        });
        toast.success('Встреча удалена');
        navigate(meeting.projectId ? `/project/${meeting.projectId}` : '/dashboard');
      },
      onError: () => {
        toast.error('Не удалось удалить встречу');
      },
    },
  });

  const isDirty = useMemo(() => {
    const current = new Set([creatorId, ...meeting.participantIds]);
    if (selectedIds.length !== current.size) return true;
    return selectedIds.some((id) => !current.has(id));
  }, [selectedIds, creatorId, meeting.participantIds]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [allUsers, search]);

  const toggleParticipant = (id: string) => {
    if (id === creatorId) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const ids = selectedIds.includes(creatorId) ? selectedIds : [creatorId, ...selectedIds];
    updateMeeting({ id: meeting._id, data: { participantIds: ids } });
  };

  const isScheduleDirty =
    scheduledAt !== null && scheduledAt.getTime() !== (storedDate?.getTime() ?? NaN);

  const handleReschedule = () => {
    if (!scheduledAt) return;
    rescheduleMeeting({
      id: meeting._id,
      data: { upcomingDate: scheduledAt.toISOString() },
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMeeting({ id: meeting._id });
  };

  return (
    <div className="mb-8">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setEditorOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            editorOpen
              ? 'bg-slate-900 text-white hover:bg-black'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Участники
        </button>

        <button
          onClick={() => setScheduleOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            scheduleOpen
              ? 'bg-slate-900 text-white hover:bg-black'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Дата и время
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-40 ${
            confirmDelete
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {isDeleting ? 'Удаление...' : confirmDelete ? '⚠ Подтвердить удаление' : 'Удалить встречу'}
        </button>
        {confirmDelete && !isDeleting && (
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            Отмена
          </button>
        )}
      </div>

      {/* ── Reschedule ── */}
      <AnimatePresence initial={false}>
        {scheduleOpen && (
          <motion.div
            key="schedule-editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Дата и время встречи
              </p>

              <p className="text-sm text-slate-500">
                {storedDate
                  ? `Сейчас назначена на ${formatDate(storedDate)}, ${formatTime(storedDate)}`
                  : 'Дата не назначена'}
              </p>

              <DateTimePicker
                selected={scheduledAt}
                onChange={setScheduledAt}
                showTimeSelect
                disabled={isRescheduling}
              />

              <p className="text-xs text-slate-400">
                Будущая дата вернёт встречу в предстоящие, прошедшая — сделает активной.
                Участники, ответы и текущий этап сохранятся.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleReschedule}
                  disabled={isRescheduling || !isScheduleDirty}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isRescheduling ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => {
                    setScheduledAt(storedDate);
                    setScheduleOpen(false);
                  }}
                  disabled={isRescheduling}
                  className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Participants editor ── */}
      <AnimatePresence initial={false}>
        {editorOpen && (
          <motion.div
            key="participants-editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Участники встречи
              </p>

              <Input
                type="text"
                placeholder="Поиск по имени или email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                disabled={isSaving}
              />

              <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    Никого не найдено по запросу «{search}»
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const checked = selectedIds.includes(user._id);
                    const isCreatorRow = user._id === creatorId;
                    return (
                      <label
                        key={user._id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          isCreatorRow ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-slate-50'
                        } ${checked ? 'bg-blue-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleParticipant(user._id)}
                          className="w-4 h-4 rounded accent-blue-600"
                          disabled={isSaving || isCreatorRow}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                        {isCreatorRow && (
                          <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            Создатель
                          </span>
                        )}
                        {checked && !isCreatorRow && (
                          <span className="ml-auto text-xs font-medium text-blue-600">✓</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => setEditorOpen(false)}
                  disabled={isSaving}
                  className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Отмена
                </button>
                <span className="ml-auto text-xs text-slate-400">
                  Выбрано: {selectedIds.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
