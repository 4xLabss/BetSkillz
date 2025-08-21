// Centralized presence store for managing real-time player counts
// This replaces individual in-memory stores in each API route
// In production, this should be replaced with Redis

export interface UserPresence {
  walletAddress: string;
  gameSlug: string;
  lastSeen: number;
  sessionId: string;
}

export interface GamePresenceData {
  gameSlug: string;
  users: Set<string>;
  lastActivity: number;
}

class PresenceStore {
  private gamePresence: Map<string, GamePresenceData> = new Map();
  private userPresence: Map<string, UserPresence> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive users every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveUsers();
    }, 2 * 60 * 1000);
  }

  /**
   * Register a user's presence in a game
   */
  registerUser(walletAddress: string, gameSlug: string, sessionId?: string): number {
    const now = Date.now();
    const userKey = `${walletAddress}:${gameSlug}`;
    
    // Remove user from any other games first
    this.removeUserFromAllGames(walletAddress);
    
    // Add to game presence
    if (!this.gamePresence.has(gameSlug)) {
      this.gamePresence.set(gameSlug, {
        gameSlug,
        users: new Set(),
        lastActivity: now,
      });
    }
    
    const gameData = this.gamePresence.get(gameSlug)!;
    gameData.users.add(walletAddress);
    gameData.lastActivity = now;
    
    // Update user presence
    this.userPresence.set(userKey, {
      walletAddress,
      gameSlug,
      lastSeen: now,
      sessionId: sessionId || '',
    });
    
    return gameData.users.size;
  }

  /**
   * Remove a user's presence from a specific game
   */
  unregisterUser(walletAddress: string, gameSlug: string): number {
    const userKey = `${walletAddress}:${gameSlug}`;
    
    // Remove from game presence
    const gameData = this.gamePresence.get(gameSlug);
    if (gameData) {
      gameData.users.delete(walletAddress);
      gameData.lastActivity = Date.now();
      
      // Clean up empty games
      if (gameData.users.size === 0) {
        this.gamePresence.delete(gameSlug);
      }
    }
    
    // Remove from user presence
    this.userPresence.delete(userKey);
    
    return gameData?.users.size || 0;
  }

  /**
   * Remove user from all games (when switching games or logging out)
   */
  removeUserFromAllGames(walletAddress: string): void {
    const userEntries = Array.from(this.userPresence.entries());
    
    for (const [userKey, presence] of userEntries) {
      if (presence.walletAddress === walletAddress) {
        this.unregisterUser(walletAddress, presence.gameSlug);
      }
    }
  }

  /**
   * Get online count for a specific game
   */
  getGameOnlineCount(gameSlug: string): number {
    const gameData = this.gamePresence.get(gameSlug);
    return gameData?.users.size || 0;
  }

  /**
   * Get all games with their online counts
   */
  getAllGamePresence(): Array<{ gameSlug: string; onlineCount: number; lastActivity: number }> {
    return Array.from(this.gamePresence.entries()).map(([gameSlug, data]) => ({
      gameSlug,
      onlineCount: data.users.size,
      lastActivity: data.lastActivity,
    }));
  }

  /**
   * Get total online users across all games
   */
  getTotalOnlineCount(): number {
    const allUsers = new Set<string>();
    
    for (const gameData of this.gamePresence.values()) {
      for (const user of gameData.users) {
        allUsers.add(user);
      }
    }
    
    return allUsers.size;
  }

  /**
   * Update user's last seen timestamp (heartbeat)
   */
  updateUserHeartbeat(walletAddress: string, gameSlug: string): boolean {
    const userKey = `${walletAddress}:${gameSlug}`;
    const userPresence = this.userPresence.get(userKey);
    
    if (userPresence) {
      userPresence.lastSeen = Date.now();
      
      // Update game activity
      const gameData = this.gamePresence.get(gameSlug);
      if (gameData) {
        gameData.lastActivity = Date.now();
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Check if a user is currently active in a game
   */
  isUserActive(walletAddress: string, gameSlug: string): boolean {
    const userKey = `${walletAddress}:${gameSlug}`;
    const userPresence = this.userPresence.get(userKey);
    
    if (!userPresence) return false;
    
    const now = Date.now();
    const inactiveThreshold = 2 * 60 * 1000; // 2 minutes
    
    return (now - userPresence.lastSeen) < inactiveThreshold;
  }

  /**
   * Clean up inactive users
   */
  private cleanupInactiveUsers(): void {
    const now = Date.now();
    const inactiveThreshold = 2 * 60 * 1000; // 2 minutes
    
    const inactiveUsers: Array<{ walletAddress: string; gameSlug: string }> = [];
    
    for (const [userKey, presence] of this.userPresence.entries()) {
      if (now - presence.lastSeen > inactiveThreshold) {
        inactiveUsers.push({
          walletAddress: presence.walletAddress,
          gameSlug: presence.gameSlug,
        });
      }
    }
    
    // Remove inactive users
    for (const { walletAddress, gameSlug } of inactiveUsers) {
      this.unregisterUser(walletAddress, gameSlug);
    }
    
    if (inactiveUsers.length > 0) {
      console.log(`Cleaned up ${inactiveUsers.length} inactive users`);
    }
  }

  /**
   * Get debug information about current state
   */
  getDebugInfo(): {
    totalGames: number;
    totalUniqueUsers: number;
    gameDetails: Array<{ gameSlug: string; userCount: number; users: string[] }>;
  } {
    const gameDetails = Array.from(this.gamePresence.entries()).map(([gameSlug, data]) => ({
      gameSlug,
      userCount: data.users.size,
      users: Array.from(data.users),
    }));
    
    return {
      totalGames: this.gamePresence.size,
      totalUniqueUsers: this.getTotalOnlineCount(),
      gameDetails,
    };
  }

  /**
   * Destroy the store and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.gamePresence.clear();
    this.userPresence.clear();
  }
}

// Global instance (singleton pattern)
// In production, this should be replaced with Redis
let globalPresenceStore: PresenceStore | null = null;

export function getPresenceStore(): PresenceStore {
  if (!globalPresenceStore) {
    globalPresenceStore = new PresenceStore();
  }
  return globalPresenceStore;
}

// Export for testing or cleanup
export function resetPresenceStore(): void {
  if (globalPresenceStore) {
    globalPresenceStore.destroy();
    globalPresenceStore = null;
  }
}
