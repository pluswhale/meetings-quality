/**
 * Custom hook for fetching phase submissions (creator only)
 */

import { useState, useEffect } from 'react';
import { POLLING_INTERVALS } from '@/src/shared/constants';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://meetings-quality-api.onrender.com';

export const usePhaseSubmissions = (meetingId: string, isCreator: boolean) => {
  const [phaseSubmissions, setPhaseSubmissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isCreator || !meetingId) return;

    const fetchPhaseSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/meetings/${meetingId}/phase-submissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPhaseSubmissions(data);
        } else {
          throw new Error('Failed to fetch phase submissions');
        }
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch phase submissions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhaseSubmissions();
    const interval = setInterval(fetchPhaseSubmissions, POLLING_INTERVALS.PHASE_SUBMISSIONS);
    
    return () => clearInterval(interval);
  }, [isCreator, meetingId]);

  return { phaseSubmissions, isLoading, error };
};
