/**
 * useSocket - Socket.IO hook for real-time meeting presence tracking
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/src/shared/store/auth.store';

interface MeetingParticipant {
  userId: string;
  fullName: string | null;
  email: string | null;
  joinedAt: Date;
  lastSeen?: Date;
}

interface ParticipantsUpdatedData {
  meetingId: string;
  participants: MeetingParticipant[];
  totalParticipants: number;
}

interface JoinMeetingResponse {
  success: boolean;
  meetingId: string;
  participants: MeetingParticipant[];
  error?: string;
}

interface LeaveMeetingResponse {
  success: boolean;
  meetingId: string;
  error?: string;
}

export const useSocket = (meetingId: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const { currentUser } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error('🔴 No auth token found');
      return;
    }
    
    // 1. URL Construction: Ensure no double slashes or missing ports
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3002';
    
    console.log('🔌 Initializing Socket.IO connection to:', baseUrl);

    // 2. Force WebSocket transport to avoid polling CORS issues
    const newSocket = io(baseUrl, {
      auth: { token }, // Send raw token
      transports: ['websocket'], // Force WebSocket only (faster, less CORS issues)
      path: '/socket.io/', // Standard path
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // 3. Event Listeners
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Immediate join attempt upon connection if meetingId exists
      if (meetingId) {
        console.log('🚀 Triggering immediate join for:', meetingId);
        newSocket.emit('join_meeting', { meetingId }, (response: JoinMeetingResponse) => {
           if (response.success && response.participants) {
               setParticipants(response.participants);
           }
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server rejected connection (Auth failed) - do not auto-reconnect manually
        console.error('🔒 Server rejected connection. Token might be invalid.');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Connection error:', err.message);
    });

    newSocket.on('auth_error', (data) => {
        console.error('🔒 Authentication error from server:', data);
    });

    newSocket.on('participants_updated', (data: ParticipantsUpdatedData) => {
      if (data.meetingId === meetingId) {
        console.log('👥 Participants updated:', data.totalParticipants);
        setParticipants(data.participants);
        // Dispatch custom event for view model
        window.dispatchEvent(new CustomEvent('participants_updated', { detail: data }));
      }
    });

    // Listen for meeting updates (phase changes, task approvals, etc.)
    // Socket event name: meetingUpdated (camelCase per spec)
    newSocket.on('meetingUpdated', (data: any) => {
      console.log('📢 Meeting updated event received:', data);
      // Trigger refetch by dispatching custom event that view model can listen to
      window.dispatchEvent(new CustomEvent('meetingUpdated', { detail: data }));
    });

    // Also listen for phase changes
    newSocket.on('phaseChanged', (data: any) => {
      console.log('📢 Phase changed event received:', data);
      window.dispatchEvent(new CustomEvent('phaseChanged', { detail: data }));
    });

    return () => {
      console.log('🧹 Disconnecting socket');
      newSocket.removeAllListeners(); // Prevent memory leaks
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [meetingId]); // Re-connect only if meeting ID fundamentally changes (or use [] and manage join separately)

  // Explicit Join Function (can be used manually)
  const joinMeeting = useCallback(() => {
    const s = socketRef.current;
    if (!s || !s.connected || !meetingId) return;

    console.log('📤 Emitting join_meeting manually');
    s.emit('join_meeting', { meetingId }, (response: JoinMeetingResponse) => {
      if (response.success) {
        setParticipants(response.participants);
      }
    });
  }, [meetingId]);

  const leaveMeeting = useCallback(() => {
    const s = socketRef.current;
    if (!s || !meetingId) return;
    s.emit('leave_meeting', { meetingId });
    setParticipants([]);
  }, [meetingId]);

  return {
    socket,
    isConnected,
    participants,
    joinMeeting,
    leaveMeeting,
  };
};
