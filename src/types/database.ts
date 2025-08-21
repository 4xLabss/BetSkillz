// Global type definitions for BetSkillz backend

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

// Database connection types
export interface MongooseCache {
  conn: typeof import('mongoose') | null;
  promise: Promise<typeof import('mongoose')> | null;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Game difficulty enum
export type GameDifficulty = 'easy' | 'medium' | 'hard';

// User stats interface
export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  winRate: number;
  avgGameTime: number;
}

export {};
