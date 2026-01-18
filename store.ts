
import { create } from 'zustand';
import { User, Meeting, Task, MeetingPhase, EvaluationRecord } from './types';

type AppState = {
  currentUser: User | null;
  meetings: Meeting[];
  tasks: Task[];
  evaluations: EvaluationRecord[];
  
  // Actions
  login: (email: string) => boolean;
  register: (name: string, email: string) => void;
  logout: () => void;
  createMeeting: (title: string, question: string) => string;
  updateMeetingPhase: (id: string, phase: MeetingPhase) => void;
  submitEvaluation: (record: EvaluationRecord) => void;
  updateTask: (taskId: string, description: string, deadline: string) => void;
  syncFromStorage: () => void;
};

const getInitialState = () => {
  try {
    return {
      currentUser: JSON.parse(localStorage.getItem('mq_user') || 'null'),
      meetings: JSON.parse(localStorage.getItem('mq_meetings') || '[]'),
      tasks: JSON.parse(localStorage.getItem('mq_tasks') || '[]'),
      evaluations: JSON.parse(localStorage.getItem('mq_evaluations') || '[]'),
    };
  } catch (e) {
    return {
      currentUser: null,
      meetings: [],
      tasks: [],
      evaluations: [],
    };
  }
};

export const useStore = create<AppState>((set, get) => ({
  ...getInitialState(),

  syncFromStorage: () => {
    const savedMeetings = localStorage.getItem('mq_meetings');
    if (savedMeetings) {
      const parsed = JSON.parse(savedMeetings);
      if (JSON.stringify(get().meetings) !== savedMeetings) {
        set({ meetings: parsed });
      }
    }
  },

  login: (email: string) => {
    const users = JSON.parse(localStorage.getItem('mq_all_users') || '[]');
    const user = users.find((u: User) => u.email === email);
    if (user) {
      set({ currentUser: user });
      localStorage.setItem('mq_user', JSON.stringify(user));
      return true;
    }
    return false;
  },

  register: (name: string, email: string) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), fullName: name, email };
    const users = JSON.parse(localStorage.getItem('mq_all_users') || '[]');
    users.push(newUser);
    localStorage.setItem('mq_all_users', JSON.stringify(users));
    set({ currentUser: newUser });
    localStorage.setItem('mq_user', JSON.stringify(newUser));
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('mq_user');
  },

  createMeeting: (title: string, question: string) => {
    const { currentUser } = get();
    if (!currentUser) return '';
    const id = Math.random().toString(36).substr(2, 9);
    const newMeeting: Meeting = {
      id,
      title,
      question,
      creatorId: currentUser.id,
      currentPhase: MeetingPhase.DISCUSSION,
      participantIds: [currentUser.id],
      createdAt: Date.now()
    };
    const nextMeetings = [...get().meetings, newMeeting];
    set({ meetings: nextMeetings });
    localStorage.setItem('mq_meetings', JSON.stringify(nextMeetings));
    return id;
  },

  updateMeetingPhase: (id: string, phase: MeetingPhase) => {
    const nextMeetings = get().meetings.map(m => m.id === id ? { ...m, currentPhase: phase } : m);
    set({ meetings: nextMeetings });
    localStorage.setItem('mq_meetings', JSON.stringify(nextMeetings));
  },

  submitEvaluation: (record: EvaluationRecord) => {
    const nextEvals = [...get().evaluations];
    const existingIdx = nextEvals.findIndex(r => r.userId === record.userId && r.meetingId === record.meetingId);
    
    if (existingIdx !== -1) nextEvals[existingIdx] = record;
    else nextEvals.push(record);
    
    set({ evaluations: nextEvals });
    localStorage.setItem('mq_evaluations', JSON.stringify(nextEvals));

    if (record.taskDescription && record.deadline) {
      const taskId = `task_${record.userId}_${record.meetingId}`;
      const nextTasks = [...get().tasks];
      const existingTaskIdx = nextTasks.findIndex(t => t.id === taskId);
      const newTask: Task = {
        id: taskId,
        meetingId: record.meetingId,
        authorId: record.userId,
        description: record.taskDescription!,
        deadline: record.deadline!,
        contributionImportance: record.contributionImportance || 0
      };
      
      if (existingTaskIdx !== -1) nextTasks[existingTaskIdx] = newTask;
      else nextTasks.push(newTask);
      
      set({ tasks: nextTasks });
      localStorage.setItem('mq_tasks', JSON.stringify(nextTasks));
    }
  },

  updateTask: (taskId: string, description: string, deadline: string) => {
    const nextTasks = get().tasks.map(t => t.id === taskId ? { ...t, description, deadline } : t);
    set({ tasks: nextTasks });
    localStorage.setItem('mq_tasks', JSON.stringify(nextTasks));
  }
}));

// Setup background polling for real-time simulation
if (typeof window !== 'undefined') {
  setInterval(() => {
    useStore.getState().syncFromStorage();
  }, 2000);
}
