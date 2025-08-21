"use client"
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface PresenceContextType {
  currentGame: string | null;
  setCurrentGame: (gameSlug: string | null) => void;
  isTracking: boolean;
  globalOnlineCount: number;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

interface PresenceProviderProps {
  children: ReactNode;
}

/**
 * Provider for managing user presence across the application
 * Automatically tracks which game the user is currently viewing/playing
 */
export function PresenceProvider({ children }: PresenceProviderProps) {
  const { data: session, status } = useSession();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [globalOnlineCount, setGlobalOnlineCount] = useState<number>(0);

  const isAuthenticated = status === 'authenticated' && session?.user;

  // Register presence when currentGame changes
  useEffect(() => {
    if (!currentGame || !isAuthenticated) {
      setIsTracking(false);
      return;
    }

    let isActive = true;
    setIsTracking(true);

    // Register presence
    const registerPresence = async () => {
      try {
        const response = await fetch(`/api/presence/${currentGame}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('Failed to register presence');
        }
      } catch (error) {
        console.error('Error registering presence:', error);
      }
    };

    // Unregister presence
    const unregisterPresence = async () => {
      if (!isActive) return;
      
      try {
        await fetch(`/api/presence/${currentGame}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error unregistering presence:', error);
      }
    };

    // Heartbeat to maintain presence
    const heartbeat = async () => {
      if (!isActive) return;
      
      try {
        await fetch(`/api/presence/${currentGame}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    };

    // Initial registration
    registerPresence();

    // Set up heartbeat interval (every 45 seconds)
    const heartbeatInterval = setInterval(heartbeat, 45000);

    // Cleanup function
    return () => {
      isActive = false;
      clearInterval(heartbeatInterval);
      unregisterPresence();
      setIsTracking(false);
    };
  }, [currentGame, isAuthenticated]);

  // Fetch global online count periodically
  useEffect(() => {
    const fetchGlobalCount = async () => {
      try {
        const response = await fetch('/api/presence');
        const data = await response.json();
        
        if (data.success) {
          setGlobalOnlineCount(data.data.totalOnline);
        }
      } catch (error) {
        console.error('Error fetching global presence:', error);
      }
    };

    // Initial fetch
    fetchGlobalCount();

    // Set up polling interval (every 2 minutes)
    const interval = setInterval(fetchGlobalCount, 120000);

    return () => clearInterval(interval);
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentGame && isAuthenticated) {
        // User switched away - unregister presence
        fetch(`/api/presence/${currentGame}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(console.error);
      } else if (!document.hidden && currentGame && isAuthenticated) {
        // User came back - register presence
        fetch(`/api/presence/${currentGame}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentGame, isAuthenticated]);

  // Handle beforeunload to cleanup presence
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentGame && isAuthenticated) {
        // Use sendBeacon for reliable cleanup on page unload
        navigator.sendBeacon(`/api/presence/${currentGame}`, JSON.stringify({ method: 'DELETE' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentGame, isAuthenticated]);

  const value: PresenceContextType = {
    currentGame,
    setCurrentGame,
    isTracking,
    globalOnlineCount,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

/**
 * Hook to use the presence context
 */
export function usePresenceContext() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresenceContext must be used within a PresenceProvider');
  }
  return context;
}

/**
 * Hook to register presence for a specific game
 * Should be used on game pages
 */
export function useGamePresenceRegistration(gameSlug: string) {
  const { setCurrentGame } = usePresenceContext();

  useEffect(() => {
    setCurrentGame(gameSlug);
    
    return () => {
      setCurrentGame(null);
    };
  }, [gameSlug, setCurrentGame]);
}
