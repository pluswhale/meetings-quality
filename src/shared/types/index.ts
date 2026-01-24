
export const MeetingPhase = {
  DISCUSSION: 'DISCUSSION',
  EVALUATION: 'EVALUATION',
  SUMMARY: 'SUMMARY',
  FINISHED: 'FINISHED'
} as const;

export type MeetingPhase = typeof MeetingPhase[keyof typeof MeetingPhase];

export type User = {
  id: string;
  fullName: string;
  email: string;
};

export type Meeting = {
  id: string;
  title: string;
  question: string;
  creatorId: string;
  currentPhase: MeetingPhase;
  participantIds: string[];
  createdAt: number;
};

export type EvaluationRecord = {
  userId: string;
  meetingId: string;
  understandingScore: number; // 0-100
  influenceScores: Record<string, number>; // userId -> percentage
  emotionalImpacts: Record<string, number>; // userId -> -50 to 50
  toxicParticipants: string[]; // List of userIds
  taskDescription?: string;
  deadline?: string;
  contributionImportance?: number; // 0-100
};

export type Task = {
  id: string;
  meetingId: string;
  authorId: string;
  description: string;
  deadline: string;
  contributionImportance: number;
};
