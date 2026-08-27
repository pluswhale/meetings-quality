/**
 * useMeetingSocket
 *
 * Socket.IO lifecycle + event wiring.
 *
 * Live-vote architecture (v3):
 *   - user:update_live_vote  fires on every slider release / field blur
 *   - room:vote_updated      server broadcasts to all room members; Zustand updates instantly
 *   - NO submit buttons, NO user:submit_vote, NO submissions[]
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/src/shared/store/auth.store';
import {
  useMeetingStore,
  type MeetingPhase,
  type ActiveParticipant,
  type RetroTaskStatus,
  type LiveVoteEntry,
  type VotingProgress,
} from '../store/useMeetingStore';
import { meetingDetailQueryKeys } from './queryKeys';

// ─── Hook return type ──────────────────────────────────────────────────────────

export interface UseMeetingSocketReturn {
  /** Persists vote data immediately and broadcasts to room. Fires on slider release / field blur. */
  emitUpdateLiveVote: (phase: MeetingPhase, payload: Record<string, unknown>) => void;
  emitRetroStatus: (taskId: string, status: 'completed' | 'incomplete', statusNote?: string) => void;
  emitAdvancePhase: (toPhase: MeetingPhase) => void;
  emitApproveTask: (taskId: string, approved: boolean) => void;
  emitFinishMeeting: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useMeetingSocket = (meetingId: string): UseMeetingSocketReturn => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const {
    syncFromServer,
    setParticipants,
    setPendingVoters,
    markSelfSubmitted,
    setPhase,
    setMyTaskApproved,
    updateRetroStatuses,
    updateVote,
    setTaskApprovalInStore,
    setVotingProgress,
    setConnected,
    setReconnecting,
    setWaitingForCreator,
    reset,
  } = useMeetingStore();

  const userId = currentUser?._id ?? '';

  // ─── Connection setup ────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !meetingId) return;

    const baseUrl =
      (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ??
      'http://localhost:3002';

    const socket = io(baseUrl, {
      auth: { token },
      // Polling is kept as a fallback: mobile networks and OS connection culling
      // break WebSockets often enough that websocket-only leaves the client with
      // no channel at all.
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // ── Connection events ────────────────────────────────────────────────────

    // Retry interval handle for creator_not_present case.
    let creatorWaitInterval: ReturnType<typeof setInterval> | null = null;

    const emitJoin = () => {
      socket.emit('room:join', { meetingId }, (res: { success: boolean; error?: string }) => {
        if (!res.success) {
          if (res.error === 'creator_not_present') {
            // Block participant — creator hasn't connected yet.
            setWaitingForCreator(true);
            console.debug('[WS] room:join — waiting for creator');
            // Schedule a retry every 15 seconds.
            if (!creatorWaitInterval) {
              creatorWaitInterval = setInterval(() => {
                if (socket.connected) {
                  console.debug('[WS] retrying room:join (creator wait)');
                  emitJoin();
                }
              }, 15_000);
            }
          } else {
            console.error('[WS] room:join failed', res.error);
            toast.error(`Failed to join room: ${res.error ?? 'Unknown error'}`);
          }
        } else {
          // Successful join — clear any pending retry timer.
          if (creatorWaitInterval) {
            clearInterval(creatorWaitInterval);
            creatorWaitInterval = null;
          }
          setWaitingForCreator(false);
          console.debug('[WS] room:join ok');
        }
      });
    };

    /**
     * Re-runs the join handshake — the server answers it with a full
     * room:state_sync — and refreshes the REST meeting document alongside it,
     * so both channels converge on the server's current state.
     */
    const joinAndResync = () => {
      emitJoin();
      queryClient.invalidateQueries({
        queryKey: meetingDetailQueryKeys.meeting(meetingId),
      });
    };

    /**
     * Recovers state the page may have missed. A backgrounded mobile tab can be
     * frozen or have its socket dropped without the page being told, so events
     * such as room:phase_changed are simply lost; reconnecting alone may not
     * happen until long after the user is looking at the screen again.
     */
    const recoverMissedEvents = () => {
      if (!socket.connected) {
        // The connect handler resyncs once the connection is back.
        socket.connect();
        return;
      }
      joinAndResync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') recoverMissedEvents();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // pageshow also covers back-forward cache restores, where visibilitychange
    // does not necessarily fire.
    window.addEventListener('pageshow', recoverMissedEvents);

    socket.on('connect', () => {
      setConnected(true);
      setReconnecting(false);
      console.debug('[WS] connected', socket.id);
      joinAndResync();
    });

    socket.on('connect_error', (err) => {
      console.error('[WS] connect_error', err.message);
      toast.error(`Connection error: ${err.message}`, { id: 'ws-connect-error', duration: 5000 });
    });

    socket.on('disconnect', (reason) => {
      console.debug('[WS] disconnected', reason);
      setConnected(false);
      if (reason !== 'io client disconnect') {
        setReconnecting(true);
        toast.loading('Reconnecting…', { id: 'ws-reconnect', duration: 10000 });
      }
    });

    socket.io.on('reconnect', () => {
      toast.dismiss('ws-reconnect');
    });

    socket.on('error:unauthorized', () => {
      toast.error('Session expired. Please log in again.');
      socket.disconnect();
    });

    socket.on('error:forbidden', (data: { message: string }) => {
      toast.error(data.message);
    });

    // ── Server → Client events ───────────────────────────────────────────────

    socket.on('room:state_sync', (payload: Record<string, unknown>) => {
      console.debug('[WS] room:state_sync', payload);
      syncFromServer({ ...(payload as Parameters<typeof syncFromServer>[0]), userId });
    });

    socket.on(
      'room:participants_updated',
      (data: { meetingId: string; participants: ActiveParticipant[] }) => {
        if (data.meetingId === meetingId) {
          setParticipants(data.participants);
        }
      },
    );

    socket.on(
      'room:pending_voters_updated',
      (data: {
        meetingId: string;
        phase: MeetingPhase;
        pending: ActiveParticipant[];
        submitted: string[];
      }) => {
        if (data.meetingId === meetingId) {
          setPendingVoters(data.pending, data.submitted);
        }
      },
    );

    // room:vote_updated — fires for every user:update_live_vote.
    // Replaces both room:vote_received and room:submission_created.
    // All room members receive this so the creator panel updates instantly.
    socket.on(
      'room:vote_updated',
      (data: {
        meetingId: string;
        userId: string;
        phase: MeetingPhase;
        payload: Record<string, unknown>;
        fullName: string | null;
        updatedAt: string;
      }) => {
        if (data.meetingId !== meetingId) return;

        const entry: LiveVoteEntry = {
          payload: data.payload,
          fullName: data.fullName,
          updatedAt: data.updatedAt,
        };
        updateVote(data.userId, entry);

        // Mark self as having submitted data (for pending voters indicator)
        if (data.userId === userId) {
          markSelfSubmitted();
        }
      },
    );

    socket.on(
      'room:phase_changed',
      (data: { meetingId: string; phase: MeetingPhase; previousPhase?: MeetingPhase }) => {
        if (data.meetingId !== meetingId) return;
        setPhase(data.phase);

        queryClient.invalidateQueries({
          queryKey: meetingDetailQueryKeys.meeting(meetingId),
        });

        if (data.phase === 'finished') {
          queryClient.invalidateQueries({
            queryKey: meetingDetailQueryKeys.submissions(meetingId),
          });
        }
      },
    );

    socket.on(
      'room:retro_status_updated',
      (data: { meetingId: string; taskStatuses: RetroTaskStatus[] }) => {
        if (data.meetingId === meetingId) {
          updateRetroStatuses(data.taskStatuses);
        }
      },
    );

    socket.on(
      'room:task_approved',
      (data: { meetingId: string; userId: string; approved: boolean }) => {
        if (data.meetingId !== meetingId) return;
        setMyTaskApproved(data.approved);
        if (data.approved) {
          toast.success('Ваша задача одобрена организатором!');
        } else {
          toast.error('Организатор отклонил вашу задачу.');
        }
      },
    );

    socket.on(
      'room:task_approval_updated',
      (data: { meetingId: string; taskId: string; approved: boolean }) => {
        if (data.meetingId === meetingId) {
          // taskId === userId during Phase 3 — update approval map in Zustand
          setTaskApprovalInStore(data.taskId, data.approved);
          queryClient.invalidateQueries({
            queryKey: meetingDetailQueryKeys.meetingTasks(meetingId),
          });
        }
      },
    );

    socket.on('room:task_created', (data: { meetingId: string }) => {
      if (data.meetingId === meetingId) {
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.userTasks() });
        queryClient.invalidateQueries({ queryKey: meetingDetailQueryKeys.meetingTasks(meetingId) });
      }
    });

    // Meeting metadata changed outside the phase flow (e.g. the creator moved
    // the scheduled date). The payload carries only a change type, so refetch.
    socket.on('meetingUpdated', (data: { meetingId: string; type: string }) => {
      if (data.meetingId !== meetingId) return;
      if (data.type !== 'meeting_rescheduled') return;

      queryClient.invalidateQueries({
        queryKey: meetingDetailQueryKeys.meeting(meetingId),
      });
      toast('Организатор изменил дату и время встречи', { id: 'meeting-rescheduled' });
    });

    socket.on('admin:voting_progress', (progress: VotingProgress & { meetingId: string }) => {
      if (progress.meetingId === meetingId) {
        setVotingProgress({
          submitted: progress.submitted,
          total: progress.total,
          percentage: progress.percentage,
        });
      }
    });

    // ── Cleanup ──────────────────────────────────────────────────────────────

    return () => {
      if (creatorWaitInterval) clearInterval(creatorWaitInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', recoverMissedEvents);
      socket.emit('room:leave', { meetingId });
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      reset();
    };
  }, [meetingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Emitter helpers ──────────────────────────────────────────────────────────

  const emit = useCallback(
    <T>(event: string, data: T, onSuccess?: () => void) => {
      const s = socketRef.current;
      if (!s?.connected) {
        toast.error('Not connected to the meeting room.');
        return;
      }
      s.emit(event, data, (res: { success: boolean; error?: string }) => {
        if (!res?.success) {
          toast.error(res?.error ?? 'Action failed');
        } else {
          onSuccess?.();
        }
      });
    },
    [],
  );

  /**
   * Fires on every slider release or field blur.
   * Persists the full phase payload to Redis and broadcasts room:vote_updated.
   */
  const emitUpdateLiveVote = useCallback(
    (phase: MeetingPhase, payload: Record<string, unknown>) => {
      const s = socketRef.current;
      if (!s?.connected) return; // Silently skip — don't toast on every slider move
      s.emit('user:update_live_vote', { meetingId, phase, payload });
    },
    [meetingId],
  );

  const emitRetroStatus = useCallback(
    (taskId: string, status: 'completed' | 'incomplete', statusNote?: string) => {
      emit(
        'retro:submit_task_status',
        { meetingId, taskId, status, statusNote },
        () => toast.success(`Task marked as ${status}`),
      );
    },
    [emit, meetingId],
  );

  const emitAdvancePhase = useCallback(
    (toPhase: MeetingPhase) => {
      emit(
        'admin:advance_phase',
        { meetingId, toPhase },
        () => toast.success(`Phase advanced to ${toPhase}`),
      );
    },
    [emit, meetingId],
  );

  const emitApproveTask = useCallback(
    (taskId: string, approved: boolean) => {
      emit('admin:approve_task', { meetingId, taskId, approved });
    },
    [emit, meetingId],
  );

  const emitFinishMeeting = useCallback(
    () => {
      emit('admin:finish_meeting', { meetingId }, () => toast.success('Meeting finished!'));
    },
    [emit, meetingId],
  );

  return {
    emitUpdateLiveVote,
    emitRetroStatus,
    emitAdvancePhase,
    emitApproveTask,
    emitFinishMeeting,
  };
};
