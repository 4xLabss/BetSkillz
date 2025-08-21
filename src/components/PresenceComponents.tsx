import React from 'react';
import { useGamePresence, useGlobalPresence } from '@/hooks/usePresence';

interface OnlineCounterProps {
  gameSlug: string;
  className?: string;
  showLabel?: boolean;
  autoRegister?: boolean;
  pollInterval?: number;
}

/**
 * Component to display online player count for a specific game
 */
export function OnlineCounter({ 
  gameSlug, 
  className = '',
  showLabel = true,
  autoRegister = true,
  pollInterval = 30000
}: OnlineCounterProps) {
  const { onlineCount, isLoading, error } = useGamePresence(gameSlug, {
    autoRegister,
    pollInterval,
  });

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading player count
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        {showLabel && 'Online: '}
        {onlineCount.toLocaleString()}
        {showLabel && (onlineCount === 1 ? ' player' : ' players')}
      </span>
    </div>
  );
}

interface GlobalOnlineCounterProps {
  className?: string;
  showLabel?: boolean;
  pollInterval?: number;
}

/**
 * Component to display total online players across all games
 */
export function GlobalOnlineCounter({
  className = '',
  showLabel = true,
  pollInterval = 60000,
}: GlobalOnlineCounterProps) {
  const { presence, isLoading, error } = useGlobalPresence(pollInterval);

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading online count
      </div>
    );
  }

  if (isLoading || !presence) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        {showLabel && 'Total Online: '}
        {presence.totalOnline.toLocaleString()}
        {showLabel && (presence.totalOnline === 1 ? ' player' : ' players')}
      </span>
    </div>
  );
}

interface GamePresenceListProps {
  className?: string;
  maxGames?: number;
  showZeroCounts?: boolean;
}

/**
 * Component to display online counts for all games
 */
export function GamePresenceList({
  className = '',
  maxGames = 10,
  showZeroCounts = false,
}: GamePresenceListProps) {
  const { presence, isLoading, error } = useGlobalPresence();

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading game presence data
      </div>
    );
  }

  if (isLoading || !presence) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse flex items-center gap-3">
            <div className="h-4 bg-gray-300 rounded flex-1"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  let gamesToShow = presence.games;
  
  // Filter out games with zero players if requested
  if (!showZeroCounts) {
    gamesToShow = gamesToShow.filter(game => game.onlineCount > 0);
  }
  
  // Sort by online count (descending) and limit
  gamesToShow = gamesToShow
    .sort((a, b) => b.onlineCount - a.onlineCount)
    .slice(0, maxGames);

  if (gamesToShow.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No players currently online
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {gamesToShow.map((game) => (
        <div key={game.gameSlug} className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {game.gameTitle}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {game.onlineCount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface PresenceIndicatorProps {
  gameSlug: string;
  variant?: 'dot' | 'badge' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Flexible presence indicator component
 */
export function PresenceIndicator({
  gameSlug,
  variant = 'full',
  size = 'md',
  className = '',
}: PresenceIndicatorProps) {
  const { onlineCount, isLoading } = useGamePresence(gameSlug, {
    autoRegister: false, // Don't auto-register for indicators
    pollInterval: 45000, // Slightly longer interval for indicators
  });

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`bg-gray-300 rounded ${variant === 'dot' ? dotSizeClasses[size] : 'h-4 w-12'}`}></div>
      </div>
    );
  }

  if (variant === 'dot') {
    return (
      <div 
        className={`${dotSizeClasses[size]} rounded-full ${
          onlineCount > 0 ? 'bg-green-500' : 'bg-gray-400'
        } ${className}`}
        title={`${onlineCount} players online`}
      ></div>
    );
  }

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full ${sizeClasses[size]} font-medium ${
        onlineCount > 0 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-600'
      } ${className}`}>
        {onlineCount}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}>
      <div className={`${dotSizeClasses[size]} rounded-full ${
        onlineCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      }`}></div>
      <span className="font-medium">
        {onlineCount} online
      </span>
    </div>
  );
}
