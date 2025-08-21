import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface GamePresence {
  gameSlug: string;
  gameTitle: string;
  onlineCount: number;
}

export interface GlobalPresence {
  totalOnline: number;
  games: GamePresence[];
  lastUpdated: string;
}

/**
 * Hook for tracking presence in a specific game
 */
export function useGamePresence(gameSlug: string, options?: {
  pollInterval?: number;
  autoRegister?: boolean;
}) {
  const { data: session, status } = useSession();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const pollInterval = options?.pollInterval || 30000; // 30 seconds default
  const autoRegister = options?.autoRegister ?? true;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = status === 'authenticated' && session?.user;

  // Fetch current presence data
  const fetchPresence = useCallback(async () => {
    try {
      const response = await fetch(`/api/presence/${gameSlug}`);
      const data = await response.json();
      
      if (data.success) {
        setOnlineCount(data.data.onlineCount);
        setLastUpdated(data.data.lastUpdated);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch presence data');
      }
    } catch (err) {
      setError('Network error while fetching presence');
      console.error('Presence fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameSlug]);

  // Register user presence
  const registerPresence = useCallback(async () => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await fetch(`/api/presence/${gameSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsRegistered(true);
        setOnlineCount(data.data.onlineCount);
        setError(null);
        return true;
      } else {
        setError(data.error || 'Failed to register presence');
        return false;
      }
    } catch (err) {
      setError('Network error while registering presence');
      console.error('Presence registration error:', err);
      return false;
    }
  }, [gameSlug, isAuthenticated]);

  // Unregister user presence
  const unregisterPresence = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/presence/${gameSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsRegistered(false);
        setOnlineCount(data.data.onlineCount);
      }
    } catch (err) {
      console.error('Presence unregistration error:', err);
    }
  }, [gameSlug, isAuthenticated]);

  // Start polling
  useEffect(() => {
    // Initial fetch
    fetchPresence();
    
    // Auto-register if authenticated and autoRegister is enabled
    if (isAuthenticated && autoRegister) {
      registerPresence();
    }
    
    // Set up polling interval
    intervalRef.current = setInterval(fetchPresence, pollInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPresence, registerPresence, isAuthenticated, autoRegister, pollInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRegistered) {
        unregisterPresence();
      }
    };
  }, [isRegistered, unregisterPresence]);

  // Handle session changes
  useEffect(() => {
    if (status === 'unauthenticated' && isRegistered) {
      setIsRegistered(false);
    }
  }, [status, isRegistered]);

  return {
    onlineCount,
    isRegistered,
    lastUpdated,
    error,
    isLoading,
    registerPresence,
    unregisterPresence,
    refreshPresence: fetchPresence,
  };
}

/**
 * Hook for tracking global presence across all games
 */
export function useGlobalPresence(pollInterval: number = 60000) { // 1 minute default
  const [presence, setPresence] = useState<GlobalPresence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGlobalPresence = useCallback(async () => {
    try {
      const response = await fetch('/api/presence');
      const data = await response.json();
      
      if (data.success) {
        setPresence(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch global presence data');
      }
    } catch (err) {
      setError('Network error while fetching global presence');
      console.error('Global presence fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchGlobalPresence();
    
    // Set up polling interval
    intervalRef.current = setInterval(fetchGlobalPresence, pollInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchGlobalPresence, pollInterval]);

  return {
    presence,
    error,
    isLoading,
    refreshPresence: fetchGlobalPresence,
  };
}

/**
 * Hook for managing presence with page visibility optimization
 * Pauses polling when the page is not visible to save resources
 */
export function useOptimizedGamePresence(gameSlug: string, options?: {
  pollInterval?: number;
  autoRegister?: boolean;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const presenceData = useGamePresence(gameSlug, {
    ...options,
    pollInterval: isVisible ? (options?.pollInterval || 30000) : 120000, // Slow down when not visible
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    ...presenceData,
    isPageVisible: isVisible,
  };
}
