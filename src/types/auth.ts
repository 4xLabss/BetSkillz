// Authentication and NextAuth.js type definitions

import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      walletAddress: string;
      username: string;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    walletAddress: string;
    username: string;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    walletAddress: string;
    username: string;
  }
}

// Solana authentication types
export interface SolanaSignInMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement?: string;
}

export interface SolanaAuthCredentials {
  message: string; // JSON stringified SolanaSignInMessage
  signature: string; // Base58 encoded signature
}

export interface AuthSession {
  user: {
    walletAddress: string;
    username: string;
    image?: string;
  };
  expires: string;
}

// Rate limiting types
export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number;
}

// API response types for authentication
export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  rateLimitInfo?: {
    remainingAttempts: number;
    resetTime: number;
  };
}

// User profile types
export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  stats: {
    gamesPlayed: number;
    totalScore: number;
    winRate: number;
    avgGameTime: number;
  };
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
}

// Score submission types
export interface ScoreSubmission {
  gameSlug: string;
  score: number;
}

export interface UserScore {
  id: string;
  score: number;
  game: {
    title: string;
    slug: string;
  };
  createdAt: string;
}
