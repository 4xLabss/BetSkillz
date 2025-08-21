'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

// Real wallet interface using Solana wallet adapter
interface RealWallet {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  unlockedAt: string;
}

interface UserStats {
  totalGamesPlayed: number;
  totalScore: number;
  favoriteGame: string;
  winRate: number;
  averageGameTime: string;
}

interface SocialLinks {
  twitter?: string;
  discord?: string;
}

interface UserPreferences {
  theme: string;
  notifications: boolean;
  soundEffects: boolean;
  musicVolume: number;
}

interface User {
  id: string;
  username: string;
  walletAddress: string;
  avatar: string;
  level: number;
  experience: number;
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
  stats: UserStats;
  achievements: Achievement[];
  socialLinks: SocialLinks;
  preferences: UserPreferences;
}

interface WalletContextType {
  wallet: RealWallet;
  user: User | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const solanaWallet = useSolanaWallet();
  const [user, setUser] = useState<User | null>(null);

  // Create a wrapper around the Solana wallet to match our interface
  const wallet: RealWallet = {
    connected: solanaWallet.connected,
    connecting: solanaWallet.connecting,
    publicKey: solanaWallet.publicKey?.toBase58() || null,
    connect: async () => {
      await solanaWallet.connect();
    },
    disconnect: async () => {
      await solanaWallet.disconnect();
    },
    signMessage: solanaWallet.signMessage ? async (message: Uint8Array) => {
      if (!solanaWallet.signMessage) {
        throw new Error('Wallet does not support message signing');
      }
      return await solanaWallet.signMessage(message);
    } : undefined
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      // Load user data when wallet connects
      import('@/data/users.json').then(userData => {
        const currentUser = userData.default.find(u => u.id === 'current-user');
        setUser(currentUser || null);
      });
    } else {
      setUser(null);
    }
  }, [wallet.connected, wallet.publicKey]);

  return (
    <WalletContext.Provider value={{ wallet, user }}>
      {children}
    </WalletContext.Provider>
  );
}

// Main WalletProvider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviderInner>
      {children}
    </WalletProviderInner>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
