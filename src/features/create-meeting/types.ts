/**
 * Types for CreateMeeting feature
 */

export interface CreateMeetingFormData {
  title: string;
  question: string;
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

  // Mutation state
  isPending: boolean;

  // Handlers
  handleSubmit: (e: React.FormEvent) => void;
  handleNavigateBack: () => void;
}
