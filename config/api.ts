/**
 * API Configuration
 * Centralized configuration for backend API connection
 */

// Get API URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
  },
  
  // Users
  users: {
    base: `${API_BASE_URL}/users`,
    byId: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  
  // Meetings
  meetings: {
    base: `${API_BASE_URL}/meetings`,
    byId: (id: string) => `${API_BASE_URL}/meetings/${id}`,
    changePhase: (id: string) => `${API_BASE_URL}/meetings/${id}/phase`,
    submitSummary: (id: string) => `${API_BASE_URL}/meetings/${id}/summary`,
    submitEvaluation: (id: string) => `${API_BASE_URL}/meetings/${id}/evaluation`,
  },
  
  // Tasks
  tasks: {
    base: `${API_BASE_URL}/tasks`,
    byId: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    byMeeting: (meetingId: string) => `${API_BASE_URL}/tasks?meetingId=${meetingId}`,
  },
  
  // WebSocket
  websocket: {
    url: WS_BASE_URL,
  },
};

// Helper function to create authorization header
export const getAuthHeader = (token: string): HeadersInit => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper function for API calls
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Export for convenience
export default API_ENDPOINTS;
