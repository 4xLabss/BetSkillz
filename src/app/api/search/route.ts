import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Game } from '@/models';

/**
 * GET /api/search
 * Public endpoint for global search across users and games
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const type = url.searchParams.get('type') || 'all'; // all, users, games
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long',
      }, { status: 400 });
    }

    await dbConnect();

    const searchRegex = { $regex: query.trim(), $options: 'i' };
    const results: any = {
      users: [],
      games: [],
    };

    // Search users
    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { walletAddress: searchRegex },
        ]
      })
        .select('username walletAddress avatar level xp stats.gamesPlayed')
        .limit(limit)
        .exec();
    }

    // Search games
    if (type === 'all' || type === 'games') {
      results.games = await Game.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ]
      })
        .select('title slug description difficulty tags')
        .limit(limit)
        .exec();
    }

    // Calculate total results
    const totalResults = results.users.length + results.games.length;

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        query: query.trim(),
        type,
        totalResults,
        counts: {
          users: results.users.length,
          games: results.games.length,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
