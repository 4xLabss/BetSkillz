import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Game } from '@/models';
import { getPresenceStore } from '@/lib/presenceStore';

/**
 * GET /api/presence
 * Get online player counts for all active games
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get all active games
    const games = await Game.find({ isActive: true })
      .select('title slug')
      .exec();

    // Get presence data from centralized store
    const presenceStore = getPresenceStore();
    const allGamePresence = presenceStore.getAllGamePresence();
    const totalOnline = presenceStore.getTotalOnlineCount();

    // Combine game data with presence data
    const gamePresenceMap = new Map(
      allGamePresence.map(p => [p.gameSlug, p])
    );

    const presenceData = games.map(game => ({
      gameSlug: game.slug,
      gameTitle: game.title,
      onlineCount: gamePresenceMap.get(game.slug)?.onlineCount || 0,
      lastActivity: gamePresenceMap.get(game.slug)?.lastActivity || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalOnline,
        games: presenceData,
        lastUpdated: new Date().toISOString(),
        summary: {
          activeGames: presenceData.filter(g => g.onlineCount > 0).length,
          totalGames: games.length,
        },
      },
    });
  } catch (error) {
    console.error('Get global presence error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * GET /api/presence/debug
 * Debug endpoint to see detailed presence information
 * Should be disabled in production
 */
export async function OPTIONS(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint not available in production',
    }, { status: 403 });
  }

  try {
    const presenceStore = getPresenceStore();
    const debugInfo = presenceStore.getDebugInfo();

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get presence debug info error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
