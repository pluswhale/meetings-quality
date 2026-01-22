/**
 * Custom hook for API calls with authentication
 */
import { useState, useCallback } from 'react';
import { API_ENDPOINTS, apiCall, getAuthHeader } from '../config/api';

interface UseApiOptions {
  token?: string;
}

export const useApi = ({ token }: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        // Add auth header if token is available
        const headers = token
          ? { ...options.headers, ...getAuthHeader(token) }
          : options.headers;

        const data = await apiCall<T>(endpoint, {
          ...options,
          headers,
        });

        setLoading(false);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [token]
  );

  return {
    loading,
    error,
    makeRequest,
    endpoints: API_ENDPOINTS,
  };
};

export default useApi;
