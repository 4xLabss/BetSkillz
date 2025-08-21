import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Authentication utilities for API routes
 */

export interface AuthenticatedSession {
  user: {
    walletAddress: string;
    username?: string;
    image?: string;
  };
}

/**
 * Get the authenticated user session from API route
 */
export async function getAuthenticatedSession(req: NextRequest): Promise<AuthenticatedSession | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    return session as AuthenticatedSession;
  } catch (error) {
    console.error('Error getting authenticated session:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes - requires authentication
 */
export function withAuth<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const session = await getAuthenticatedSession(req);
    
    if (!session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Add session to request context
    (req as any).session = session;
    return handler(req, ...args);
  };
}

/**
 * Middleware to protect API routes - requires authentication and ownership
 * Verifies that the authenticated user's wallet matches the provided walletAddress
 */
export function withOwnership<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>,
  getWalletAddress: (req: NextRequest, ...args: T) => string
) {
  return withAuth(async (req: NextRequest, ...args: T): Promise<Response> => {
    const session = (req as any).session as AuthenticatedSession;
    const targetWalletAddress = getWalletAddress(req, ...args);
    
    if (session.user.walletAddress !== targetWalletAddress) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access denied: wallet ownership required',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(req, ...args);
  });
}

/**
 * Extract wallet address from URL parameters
 */
export function getWalletFromParams(req: NextRequest, context: { params: { walletAddress: string } }): string {
  return context.params.walletAddress;
}

/**
 * Extract wallet address from URL parameters (for routes using [wallet])
 */
export function getWalletFromWalletParams(req: NextRequest, context: { params: { wallet: string } }): string {
  return context.params.wallet;
}

/**
 * Rate limiting utility for authentication endpoints
 */
export class AuthRateLimit {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      });
      return {
        allowed: true,
        remainingAttempts: this.MAX_ATTEMPTS - 1,
        resetTime: now + this.WINDOW_MS,
      };
    }

    if (record.count >= this.MAX_ATTEMPTS) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - record.count,
      resetTime: record.resetTime,
    };
  }

  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
