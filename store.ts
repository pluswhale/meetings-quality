/**
 * Auth Store - Simplified to only handle authentication state
 * All data fetching is now handled by React Query
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  currentUser: User | null;
  token: string | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,

      setAuth: (user: User, token: string) => {
        // Save to localStorage for axios interceptor
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        
        set({ currentUser: user, token });
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        
        set({ currentUser: null, token: null });
      },

      updateUser: (user: User) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        set({ currentUser: user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    }
  )
);

// Initialize from localStorage on app start (in case of page refresh)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('current_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useStore.setState({ currentUser: user, token });
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }
}
