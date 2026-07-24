import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { ProjectParticipantRefDto } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import {
  useProjectsControllerUpdate,
  getProjectsControllerFindOneQueryKey,
} from '@/src/shared/api/generated/projects/projects';
import { useUsersControllerFindAll } from '@/src/shared/api/generated/users/users';
import { useAuthStore } from '@/src/shared/store/auth.store';
import { Input } from '@/src/shared/ui';

interface ProjectParticipantsTabProps {
  participants: ProjectParticipantRefDto[];
  creatorId: ProjectParticipantRefDto;
  projectId: string;
}

export const ProjectParticipantsTab: React.FC<ProjectParticipantsTabProps> = ({
  participants,
  creatorId,
  projectId,
}) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  const isCreator = Boolean(currentUser && creatorId._id === currentUser._id);

  // Local editable selection — synced from the server list whenever it changes.
  const [selectedIds, setSelectedIds] = useState<string[]>(() => participants.map((p) => p._id));
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSelectedIds(participants.map((p) => p._id));
  }, [participants]);

  const { data: allUsers = [] } = useUsersControllerFindAll({
    query: { enabled: isCreator },
  });

  const { mutate: updateProject, isPending } = useProjectsControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getProjectsControllerFindOneQueryKey(projectId) });
        toast.success('Участники обновлены');
      },
      onError: () => {
        toast.error('Не удалось обновить участников');
      },
    },
  });

  const isDirty = useMemo(() => {
    if (selectedIds.length !== participants.length) return true;
    const current = new Set(participants.map((p) => p._id));
    return selectedIds.some((id) => !current.has(id));
  }, [selectedIds, participants]);

  // Display data: known participants + anyone newly added from the user directory.
  const displayList = useMemo(() => {
    return selectedIds.map((id) => {
      const participant = participants.find((p) => p._id === id);
      const user = allUsers.find((u) => u._id === id);

      return {
        ...participant,
        fullName: participant?.fullName || user?.fullName || '—',
        email: participant?.email || user?.email || '',
      };
    });
  }, [selectedIds, participants, allUsers]);

  const addCandidates = useMemo(() => {
    const selected = new Set(selectedIds);
    const q = search.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (selected.has(u._id)) return false;
      if (!q) return true;
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [allUsers, selectedIds, search]);

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleAdd = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSave = () => {
    // Creator is always preserved server-side, but send the full list including them.
    const ids = selectedIds.includes(creatorId._id)
      ? selectedIds
      : [creatorId._id, ...selectedIds];
    updateProject({ id: projectId, data: { participantIds: ids } });
  };

  const handleReset = () => {
    setSelectedIds(participants.map((p) => p._id));
    setSearch('');
  };

  if (participants?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-slate-500 font-medium">Нет участников</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {displayList.map((p) => (
          <ParticipantRow
            key={p._id}
            participant={p}
            isCreator={p._id === creatorId._id}
            canRemove={isCreator && p._id !== creatorId._id}
            onRemove={() => handleRemove(p._id)}
          />
        ))}
      </div>

      {isCreator && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Добавить участников
          </p>

          <Input
            type="text"
            placeholder="Поиск по имени или email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            disabled={isPending}
          />

          <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {addCandidates.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">
                {search ? `Никого не найдено по запросу «${search}»` : 'Все пользователи уже в проекте'}
              </p>
            ) : (
              addCandidates.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleAdd(user._id)}
                    className="w-4 h-4 rounded accent-blue-600"
                    disabled={isPending}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {isDirty && (
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={handleReset}
                disabled={isPending}
                className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Participant row ──────────────────────────────────────────────────────────

const ParticipantRow: React.FC<{
  participant: ProjectParticipantRefDto;
  isCreator: boolean;
  canRemove: boolean;
  onRemove: () => void;
}> = ({ participant, isCreator, canRemove, onRemove }) => {
  const initials = participant.fullName
    ?.split(' ')
    ?.map((n) => n.charAt(0).toUpperCase())
    ?.slice(0, 2)
    .join('');

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-100 rounded-xl">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{participant.fullName}</p>
        <p className="text-xs text-slate-400 truncate">{participant.email}</p>
      </div>

      {/* Role badge */}
      {isCreator && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Создатель
        </span>
      )}

      {/* Remove (creator only, never for the creator row) */}
      {canRemove && (
        <button
          onClick={onRemove}
          title="Убрать из проекта"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
