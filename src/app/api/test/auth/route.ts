import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-utils';

/**
 * Test authentication endpoint
 * GET /api/test/auth
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No active session',
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        walletAddress: session.user.walletAddress,
        username: session.user.username,
      },
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
