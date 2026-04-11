/**
 * Types for CreateMeeting feature
 */

export interface CreateMeetingFormData {
  title: string;
  question: string;
}

export interface ParticipantOption {
  _id: string;
  fullName: string;
  email: string;
}

export interface CreateMeetingViewModel {
  // Form state
  upcomingDate: string | null;
  setUpcomingDate: (value: string | null) => void;
  title: string;
  setTitle: (value: string) => void;
  question: string;
  setQuestion: (value: string) => void;
  error: string;

  // Participants
  allUsers: ParticipantOption[];
  selectedParticipantIds: string[];
  toggleParticipant: (id: string) => void;
  participantSearch: string;
  setParticipantSearch: (v: string) => void;

  // Mutation state
  isPending: boolean;

  // Handlers
  handleSubmit: (e: React.FormEvent) => void;
  handleNavigateBack: () => void;

  // Linked meeting flag — true when ?previousMeetingId= is present in the URL
  isLinkedMeeting: boolean;
}
