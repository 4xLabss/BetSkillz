import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Game, Score } from '@/models';

/**
 * GET /api/leaderboard/[gameSlug]
 * Public endpoint to fetch the leaderboard for a specific game
 */
export async function GET(
  req: NextRequest,
  context: { params: { gameSlug: string } }
) {
  try {
    const { gameSlug } = context.params;
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const period = url.searchParams.get('period') || 'all-time'; // all-time, weekly, daily
    
    await dbConnect();

    // Find the game
    const game = await Game.findOne({ slug: gameSlug }).select('_id title slug');
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    // Build date filter for time periods
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = { createdAt: { $gte: startOfDay } };
        break;
      case 'weekly':
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: startOfWeek } };
        break;
      case 'monthly':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
        break;
      default:
        // all-time, no date filter
        break;
    }

    // Get leaderboard using aggregation for best scores per user
    const leaderboard = await Score.aggregate([
      {
        $match: {
          game: game._id,
          ...dateFilter,
        }
      },
      {
        $group: {
          _id: '$user',
          bestScore: { $max: '$score' },
          gamesPlayed: { $sum: 1 },
          lastPlayed: { $max: '$createdAt' },
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                username: 1,
                walletAddress: 1,
                avatar: 1,
                level: 1,
              }
            }
          ]
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { bestScore: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          user: '$user',
          score: '$bestScore',
          gamesPlayed: '$gamesPlayed',
          lastPlayed: '$lastPlayed',
        }
      }
    ]);

    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return NextResponse.json({
      success: true,
      data: {
        game: {
          id: game._id,
          title: game.title,
          slug: game.slug,
        },
        period,
        leaderboard: rankedLeaderboard,
        meta: {
          totalEntries: rankedLeaderboard.length,
          period,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
