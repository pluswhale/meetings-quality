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
   * Live votes map: votes[userId] = { payload, fullName, updatedAt }
   * Populated on room:state_sync (hydration) and updated on room:vote_updated (live).
   * Keyed by userId with latest payload per user for the CURRENT phase.
   * Cleared on phase change.
   */
  votes: Record<string, LiveVoteEntry>;
  votingProgress: VotingProgress;

  /**
   * Task approval map: taskApprovals[userId] = true|false
   * Updated in real-time via room:task_approval_updated.
   * userId === taskId during Phase 3 (one task per participant).
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

  // Task Evaluation local (Phase 4)
  taskEvaluations: Record<string, number>; // taskAuthorId → importanceScore

  // Connection
  isConnected: boolean;
  isReconnecting: boolean;
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

  setMyTaskApproved: (approved: boolean) => void;

  // Task Evaluation
  setTaskEvaluation: (taskAuthorId: string, score: number) => void;

  // Live votes (real-time from room:vote_updated and room:state_sync)
  updateVote: (userId: string, entry: LiveVoteEntry) => void;

  // Task approvals (real-time from room:task_approval_updated)
  setTaskApprovalInStore: (userId: string, approved: boolean) => void;

  // Voting progress ring
  setVotingProgress: (progress: VotingProgress) => void;

  // Connection
  setConnected: (connected: boolean) => void;
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
  taskEvaluations: {},

  isConnected: false,
  isReconnecting: false,
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
        // Server sends votes as Record<userId, { payload, fullName, updatedAt }>.
        const serverVotes = (payload as Record<string, unknown>).votes as
          | Record<string, LiveVoteEntry>
          | undefined;
        if (serverVotes && typeof serverVotes === 'object') {
          // Merge: server is the authoritative baseline; keep any votes that
          // arrived live before this sync (keyed by userId — last write wins).
          state.votes = { ...state.votes, ...serverVotes };
        }

        state.votingProgress = { submitted: 0, total: 0, percentage: 0 };
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
        state.phase = phase;
        state.hasSubmitted = false;
        state.submittedUserIds = [];
        state.pendingVoters = [...state.participants];
        state.myDraft = null;
        // Clear all per-phase state on transition
        state.emotionalEvaluations = {};
        state.contributions = {};
        state.taskEvaluations = {};
        state.myTaskApproved = false;
        // Clear live votes and approvals — next state_sync re-hydrates for the new phase.
        state.votes = {};
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

    setMyTaskApproved: (approved) =>
      set((state) => {
        state.myTaskApproved = approved;
      }),

    setTaskEvaluation: (taskAuthorId, score) =>
      set((state) => {
        state.taskEvaluations[taskAuthorId] = score;
      }),

    updateVote: (userId, entry) =>
      set((state) => {
        state.votes[userId] = entry;
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
/** Task approval map: taskApprovals[userId] = true|false */
export const selectTaskApprovals = (s: MeetingRoomState) => s.taskApprovals;
export const selectVotingProgress = (s: MeetingRoomState) => s.votingProgress;
export const selectIsConnected = (s: MeetingRoomState) => s.isConnected;
