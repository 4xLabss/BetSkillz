import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Game } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPresenceStore } from '@/lib/presenceStore';

/**
 * GET /api/presence/[gameSlug]
 * Get current online player count for a specific game
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ gameSlug: string }> }
) {
  try {
    const { gameSlug } = await context.params;

    await dbConnect();

    // Verify game exists
    const game = await Game.findOne({ slug: gameSlug, isActive: true });
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    // Get current online count from centralized store
    const presenceStore = getPresenceStore();
    const count = presenceStore.getGameOnlineCount(gameSlug);

    return NextResponse.json({
      success: true,
      data: {
        gameSlug,
        gameTitle: game.title,
        onlineCount: count,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get presence error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * POST /api/presence/[gameSlug]
 * Register user presence for a specific game
 * Requires authentication
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ gameSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { gameSlug } = await context.params;
    const userWallet = (session.user as { walletAddress: string }).walletAddress;

    await dbConnect();

    // Verify game exists
    const game = await Game.findOne({ slug: gameSlug, isActive: true });
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    // Register user presence in centralized store
    const presenceStore = getPresenceStore();
    const onlineCount = presenceStore.registerUser(userWallet, gameSlug);

    return NextResponse.json({
      success: true,
      data: {
        gameSlug,
        gameTitle: game.title,
        registered: true,
        onlineCount,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Register presence error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/presence/[gameSlug]
 * Remove user presence from a specific game
 * Requires authentication
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ gameSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { gameSlug } = await context.params;
    const userWallet = (session.user as { walletAddress: string }).walletAddress;

    // Remove user presence from centralized store
    const presenceStore = getPresenceStore();
    const onlineCount = presenceStore.unregisterUser(userWallet, gameSlug);

    return NextResponse.json({
      success: true,
      data: {
        gameSlug,
        removed: true,
        onlineCount,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Remove presence error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
