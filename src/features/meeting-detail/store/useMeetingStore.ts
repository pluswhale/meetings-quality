import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ─── Domain types ──────────────────────────────────────────────────────────────

export type MeetingPhase =
  | 'retrospective'
  | 'emotional_evaluation'
  | 'understanding_contribution'
  | 'task_planning'
  | 'task_evaluation'
  | 'finished';

export type MeetingStatus = 'upcoming' | 'active' | 'finished';

export interface ActiveParticipant {
  userId: string;
  fullName: string | null;
  email: string | null;
  socketId?: string;
  joinedAt: string;
  lastSeen?: string;
}

export interface PendingVoter extends ActiveParticipant {}

export interface RetroTask {
  _id: string;
  /** MongoDB userId of the task author (used to display name in retro view). */
  authorId: string;
  description: string;
  commonQuestion: string;
  deadline: string;
  contributionImportance: number;
  estimateHours: number;
  isCompleted: boolean;
}

export interface RetroTaskStatus {
  taskId: string;
  userId: string;
  status: 'completed' | 'incomplete';
  statusNote: string | null;
  updatedAt: string;
}

/**
 * A single live vote entry from one user.
 * Stored in the votes map and updated in real-time via room:vote_updated.
 */
export interface LiveVoteEntry {
  /** Raw phase payload (e.g. { evaluations: [...] }) */
  payload: Record<string, unknown>;
  /** Display name for creator panel */
  fullName: string | null;
  /** ISO timestamp of the last update */
  updatedAt: string;
}

export interface VotingProgress {
  submitted: number;
  total: number;
  percentage: number;
}

export interface DraftVote {
  [key: string]: string;
}

// ─── Emotional evaluation local state ─────────────────────────────────────────

export interface EmotionalEntry {
  emotionalScale: number;
  isToxic: boolean;
}

export type ContributionsMap = Record<string, number>;

// ─── Store shape ───────────────────────────────────────────────────────────────

interface MeetingRoomState {
  // Room identity
  meetingId: string | null;
  /** null until first room:state_sync arrives */
  phase: MeetingPhase | null;
  status: MeetingStatus;
  previousMeetingId: string | null;

  // Presence
  participants: ActiveParticipant[];
  pendingVoters: PendingVoter[];
  submittedUserIds: string[];

  // Current user
  hasSubmitted: boolean;
  myDraft: DraftVote | null;

  // Phase 0 — Retrospective
  retroTasks: RetroTask[];
  retroStatuses: Record<string, RetroTaskStatus>; // keyed by taskId

  /**
   * Live votes for the current phase. Derived from votesByPhase[phase] and
   * kept in sync so existing consumers of `selectVotes` keep working.
   */
  votes: Record<string, LiveVoteEntry>;
  /**
   * Results of every phase entered so far. Survives phase transitions.
   * votesByPhase[phase][userId] = LiveVoteEntry
   */
  votesByPhase: Record<string, Record<string, LiveVoteEntry>>;
  /** Meeting-level «Выводы встречи», written by the creator. */
  conclusions: string;
  votingProgress: VotingProgress;

  /**
   * Task approval map. Keys are `${userId}:${taskKey}` for the multi-task
   * flow, or `userId` for the legacy one-task-per-user path.
   */
  taskApprovals: Record<string, boolean>;

  // Emotional evaluation local (Phase 1)
  emotionalEvaluations: Record<string, EmotionalEntry>;

  // Understanding & Contribution local (Phase 2)
  understandingScore: number;
  contributions: ContributionsMap;

  // Task Planning local (Phase 3)
  taskDescription: string;
  taskCommonQuestion: string;
  taskDeadline: string;
  taskExpectedContribution: number;
  taskEstimateHours: number;
  /** Set to true when the creator approves this user's task via room:task_approved. */
  myTaskApproved: boolean;
  /** Per-task approval, keyed by taskKey (falls back to userId for legacy). */
  myTaskApprovals: Record<string, boolean>;

  // Task Evaluation local (Phase 4) — keyed by task `_id`
  taskEvaluations: Record<string, number>;

  // Connection
  isConnected: boolean;
  isReconnecting: boolean;
  /**
   * True when the participant tried to join but the creator hasn't connected
   * yet (backend rejects with 'creator_not_present').
   * The socket hook retries automatically; this flag drives the waiting screen.
   */
  isWaitingForCreator: boolean;
}

interface MeetingRoomActions {
  // Initialised from room:state_sync
  syncFromServer: (payload: Partial<MeetingRoomState> & {
    submittedUserIds: string[];
    userId: string;
  }) => void;

  // Presence
  setParticipants: (participants: ActiveParticipant[]) => void;
  setPendingVoters: (pending: PendingVoter[], submitted: string[]) => void;

  // Marks the current user as having sent live vote data this phase
  markSelfSubmitted: () => void;

  // Phase
  setPhase: (phase: MeetingPhase) => void;

  // Retro
  updateRetroStatuses: (statuses: RetroTaskStatus[]) => void;

  // Drafts
  setMyDraft: (draft: DraftVote | null) => void;

  // Emotional evaluation
  setEmotionalEntry: (participantId: string, entry: EmotionalEntry) => void;
  resetEmotionalEvaluations: () => void;

  // Understanding & Contribution
  setUnderstandingScore: (score: number) => void;
  setContribution: (participantId: string, value: number) => void;
  resetUnderstanding: () => void;

  // Task Planning
  setTaskField: (field: keyof Pick<
    MeetingRoomState,
    'taskDescription' | 'taskCommonQuestion' | 'taskDeadline'
  >, value: string) => void;
  setTaskNumber: (field: keyof Pick<
    MeetingRoomState,
    'taskExpectedContribution' | 'taskEstimateHours'
  >, value: number) => void;

  setMyTaskApproved: (approved: boolean, taskKey?: string) => void;

  // Task Evaluation
  setTaskEvaluation: (taskAuthorId: string, score: number) => void;

  // Live votes (real-time from room:vote_updated and room:state_sync)
  updateVote: (userId: string, entry: LiveVoteEntry, phase?: MeetingPhase) => void;
  setConclusions: (text: string) => void;

  // Task approvals (real-time from room:task_approval_updated)
  setTaskApprovalInStore: (userId: string, approved: boolean) => void;

  // Voting progress ring
  setVotingProgress: (progress: VotingProgress) => void;

  // Connection
  setConnected: (connected: boolean) => void;
  setWaitingForCreator: (waiting: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;

  // Reset when leaving meeting
  reset: () => void;
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState: MeetingRoomState = {
  meetingId: null,
  phase: null,
  status: 'active',
  previousMeetingId: null,

  participants: [],
  pendingVoters: [],
  submittedUserIds: [],

  hasSubmitted: false,
  myDraft: null,

  retroTasks: [],
  retroStatuses: {},

  votes: {},
  votesByPhase: {},
  conclusions: '',
  votingProgress: { submitted: 0, total: 0, percentage: 0 },
  taskApprovals: {},

  emotionalEvaluations: {},
  understandingScore: 50,
  contributions: {},
  taskDescription: '',
  taskCommonQuestion: '',
  taskDeadline: '',
  taskExpectedContribution: 0,
  taskEstimateHours: 0,
  myTaskApproved: false,
  myTaskApprovals: {},
  taskEvaluations: {},

  isConnected: false,
  isReconnecting: false,
  isWaitingForCreator: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMeetingStore = create<MeetingRoomState & MeetingRoomActions>()(
  immer((set) => ({
    ...initialState,

    syncFromServer: (payload) =>
      set((state) => {
        if (payload.meetingId !== undefined) state.meetingId = payload.meetingId;
        if (payload.phase !== undefined) state.phase = payload.phase;
        if (payload.status !== undefined) state.status = payload.status;
        if (payload.previousMeetingId !== undefined) state.previousMeetingId = payload.previousMeetingId;
        if (payload.participants !== undefined) state.participants = payload.participants;
        if (payload.retroTasks !== undefined) state.retroTasks = payload.retroTasks as RetroTask[];
        if (payload.myDraft !== undefined) state.myDraft = payload.myDraft;

        state.submittedUserIds = payload.submittedUserIds;
        state.hasSubmitted = payload.submittedUserIds.includes(payload.userId);

        if (payload.retroStatuses) {
          state.retroStatuses = {};
          (payload.retroStatuses as unknown as RetroTaskStatus[]).forEach((s) => {
            state.retroStatuses[s.taskId] = s;
          });
        }

        const submittedSet = new Set(payload.submittedUserIds);
        state.pendingVoters = (payload.participants ?? state.participants).filter(
          (p) => !submittedSet.has(p.userId),
        );

        // Hydrate live votes from server snapshot.
        // Prefer votesByPhase (all phases); fall back to the flat `votes` map
        // for the live phase so an older server still hydrates the panel.
        const extra = payload as Record<string, unknown>;
        const serverByPhase = extra.votesByPhase as
          | Record<string, Record<string, LiveVoteEntry>>
          | undefined;
        if (serverByPhase && typeof serverByPhase === 'object') {
          for (const [p, map] of Object.entries(serverByPhase)) {
            state.votesByPhase[p] = { ...(state.votesByPhase[p] ?? {}), ...map };
          }
        }

        const serverVotes = extra.votes as Record<string, LiveVoteEntry> | undefined;
        if (serverVotes && typeof serverVotes === 'object') {
          const livePhase = (payload.phase ?? state.phase) as string | null;
          if (livePhase) {
            state.votesByPhase[livePhase] = {
              ...(state.votesByPhase[livePhase] ?? {}),
              ...serverVotes,
            };
          }
        }

        const live = (payload.phase ?? state.phase) as string | null;
        state.votes = live ? (state.votesByPhase[live] ?? {}) : {};

        if (typeof extra.conclusions === 'string') {
          state.conclusions = extra.conclusions;
        }

        // Hydrate task approval flags — sent by the server in room:state_sync.
        const serverApprovals = (payload as Record<string, unknown>).taskApprovals as
          | Record<string, boolean>
          | undefined;
        if (serverApprovals && typeof serverApprovals === 'object') {
          state.taskApprovals = { ...state.taskApprovals, ...serverApprovals };
        }

        state.votingProgress = { submitted: 0, total: 0, percentage: 0 };
        // Clear the waiting flag on successful state sync.
        state.isWaitingForCreator = false;
      }),

    setParticipants: (participants) =>
      set((state) => {
        state.participants = participants;
        const submittedSet = new Set(state.submittedUserIds);
        state.pendingVoters = participants.filter((p) => !submittedSet.has(p.userId));
      }),

    setPendingVoters: (pending, submitted) =>
      set((state) => {
        state.pendingVoters = pending;
        state.submittedUserIds = submitted;
      }),

    markSelfSubmitted: () =>
      set((state) => {
        state.hasSubmitted = true;
      }),

    setPhase: (phase) =>
      set((state) => {
        // Clearing per-phase state is only correct for a real transition. A
        // replayed or duplicate phase event for the phase already on screen
        // would otherwise discard the user's in-progress answers.
        if (state.phase === phase) return;

        state.phase = phase;
        state.hasSubmitted = false;
        state.submittedUserIds = [];
        state.pendingVoters = [...state.participants];
        state.myDraft = null;
        // Local form fields are reset so the incoming phase starts clean;
        // each form hook rehydrates from votesByPhase[phase][self].
        state.emotionalEvaluations = {};
        state.contributions = {};
        state.taskEvaluations = {};
        state.myTaskApproved = false;
        state.myTaskApprovals = {};
        // Prior phases' results stay in votesByPhase. Point `votes` at the
        // new live phase so existing panel consumers keep working.
        state.votes = state.votesByPhase[phase] ?? {};
        state.taskApprovals = {};
      }),

    updateRetroStatuses: (statuses) =>
      set((state) => {
        statuses.forEach((s) => {
          state.retroStatuses[s.taskId] = s;
        });
      }),

    setMyDraft: (draft) =>
      set((state) => {
        state.myDraft = draft;
      }),

    setEmotionalEntry: (participantId, entry) =>
      set((state) => {
        state.emotionalEvaluations[participantId] = entry;
      }),

    resetEmotionalEvaluations: () =>
      set((state) => {
        state.emotionalEvaluations = {};
      }),

    setUnderstandingScore: (score) =>
      set((state) => {
        state.understandingScore = score;
      }),

    setContribution: (participantId, value) =>
      set((state) => {
        state.contributions[participantId] = value;
      }),

    resetUnderstanding: () =>
      set((state) => {
        state.understandingScore = 50;
        state.contributions = {};
      }),

    setTaskField: (field, value) =>
      set((state) => {
        (state as Record<string, unknown>)[field] = value;
      }),

    setTaskNumber: (field, value) =>
      set((state) => {
        (state as Record<string, unknown>)[field] = value;
      }),

    setMyTaskApproved: (approved, taskKey) =>
      set((state) => {
        state.myTaskApproved = approved;
        if (taskKey) state.myTaskApprovals[taskKey] = approved;
      }),

    setTaskEvaluation: (taskAuthorId, score) =>
      set((state) => {
        state.taskEvaluations[taskAuthorId] = score;
      }),

    updateVote: (userId, entry, phase) =>
      set((state) => {
        const targetPhase = phase ?? state.phase;
        if (!targetPhase) {
          state.votes[userId] = entry;
          return;
        }
        if (!state.votesByPhase[targetPhase]) state.votesByPhase[targetPhase] = {};
        state.votesByPhase[targetPhase][userId] = entry;
        if (targetPhase === state.phase) {
          state.votes[userId] = entry;
        }
      }),

    setConclusions: (text) =>
      set((state) => {
        state.conclusions = text;
      }),

    setTaskApprovalInStore: (userId, approved) =>
      set((state) => {
        state.taskApprovals[userId] = approved;
      }),

    setVotingProgress: (progress) =>
      set((state) => {
        state.votingProgress = progress;
      }),

    setConnected: (connected) =>
      set((state) => {
        state.isConnected = connected;
        if (connected) state.isReconnecting = false;
      }),

    setReconnecting: (reconnecting) =>
      set((state) => {
        state.isReconnecting = reconnecting;
      }),

    setWaitingForCreator: (waiting) =>
      set((state) => {
        state.isWaitingForCreator = waiting;
      }),

    reset: () => set(initialState),
  })),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectPhase = (s: MeetingRoomState): MeetingPhase | null => s.phase;
export const selectHasSubmitted = (s: MeetingRoomState) => s.hasSubmitted;
export const selectPendingVoters = (s: MeetingRoomState) => s.pendingVoters;
export const selectParticipants = (s: MeetingRoomState) => s.participants;
export const selectRetroTasks = (s: MeetingRoomState) => s.retroTasks;
export const selectRetroStatuses = (s: MeetingRoomState) => s.retroStatuses;
/** All live votes for the current phase: votes[userId] = { payload, fullName, updatedAt } */
export const selectVotes = (s: MeetingRoomState) => s.votes;
export const selectVotesByPhase = (s: MeetingRoomState) => s.votesByPhase;
export const selectConclusions = (s: MeetingRoomState) => s.conclusions;
/** Task approval map: taskApprovals[userId] = true|false */
export const selectTaskApprovals = (s: MeetingRoomState) => s.taskApprovals;
export const selectVotingProgress = (s: MeetingRoomState) => s.votingProgress;
export const selectIsConnected = (s: MeetingRoomState) => s.isConnected;
