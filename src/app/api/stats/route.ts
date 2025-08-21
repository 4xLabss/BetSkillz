import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Game, Score } from '@/models';

/**
 * GET /api/stats
 * Public endpoint to get platform statistics
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get basic counts
    const [
      totalUsers,
      totalGames,
      totalScores,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Game.countDocuments(),
      Score.countDocuments(),
      User.countDocuments({ 
        updatedAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        } 
      }),
    ]);

    // Get top games by play count
    const topGames = await Score.aggregate([
      {
        $group: {
          _id: '$game',
          playCount: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
        }
      },
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: '_id',
          as: 'game'
        }
      },
      {
        $unwind: '$game'
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          game: {
            title: '$game.title',
            slug: '$game.slug',
          },
          playCount: 1,
          avgScore: { $round: ['$avgScore', 2] },
          maxScore: 1,
        }
      }
    ]);

    // Get recent activity (last 24 hours)
    const recentActivity = {
      newUsers: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      gamesPlayed: await Score.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
    };

    // Get platform totals
    const platformTotals = await Score.aggregate([
      {
        $group: {
          _id: null,
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
        }
      }
    ]);

    const totals = platformTotals[0] || { totalScore: 0, avgScore: 0, maxScore: 0 };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalGames,
          totalScores,
          activeUsers,
        },
        recentActivity,
        topGames,
        platformTotals: {
          totalScore: totals.totalScore,
          avgScore: Math.round(totals.avgScore * 100) / 100,
          maxScore: totals.maxScore,
        },
        meta: {
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
