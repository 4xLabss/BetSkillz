import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';

/**
 * GET /api/leaderboard/global
 * Public endpoint for a global, all-time leaderboard across all games
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200);
    const sortBy = url.searchParams.get('sortBy') || 'totalScore'; // totalScore, level, xp
    const period = url.searchParams.get('period') || 'all-time';
    
    await dbConnect();

    // Build date filter for user activity
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { updatedAt: { $gte: weekAgo } };
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { updatedAt: { $gte: monthAgo } };
        break;
      default:
        // all-time, no date filter
        break;
    }

    // Define sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case 'level':
        sortCriteria = { level: -1, xp: -1 };
        break;
      case 'xp':
        sortCriteria = { xp: -1, level: -1 };
        break;
      case 'gamesPlayed':
        sortCriteria = { 'stats.gamesPlayed': -1, 'stats.totalScore': -1 };
        break;
      case 'winRate':
        sortCriteria = { 'stats.winRate': -1, 'stats.gamesPlayed': -1 };
        break;
      default: // totalScore
        sortCriteria = { 'stats.totalScore': -1, level: -1 };
        break;
    }

    // Get global leaderboard
    const users = await User.find({
      'stats.gamesPlayed': { $gt: 0 }, // Only users who have played games
      ...dateFilter,
    })
      .select('username walletAddress avatar level xp stats createdAt updatedAt')
      .sort(sortCriteria)
      .limit(limit)
      .exec();

    // Add ranking and calculate additional metrics
    const globalLeaderboard = users.map((user, index) => {
      const avgScorePerGame = user.stats.gamesPlayed > 0 
        ? Math.round(user.stats.totalScore / user.stats.gamesPlayed) 
        : 0;

      return {
        rank: index + 1,
        user: {
          id: user._id,
          username: user.username,
          walletAddress: user.walletAddress,
          avatar: user.avatar,
          level: user.level,
          xp: user.xp,
          joinDate: user.createdAt,
        },
        stats: {
          totalScore: user.stats.totalScore,
          gamesPlayed: user.stats.gamesPlayed,
          winRate: Math.round(user.stats.winRate * 100) / 100, // Round to 2 decimal places
          avgScorePerGame,
          avgGameTime: Math.round(user.stats.avgGameTime),
        },
      };
    });

    // Calculate additional metadata
    const totalUsers = await User.countDocuments({ 'stats.gamesPlayed': { $gt: 0 } });
    const totalGamesPlayed = globalLeaderboard.reduce((sum, entry) => sum + entry.stats.gamesPlayed, 0);
    const averageLevel = globalLeaderboard.length > 0 
      ? Math.round(globalLeaderboard.reduce((sum, entry) => sum + entry.user.level, 0) / globalLeaderboard.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: globalLeaderboard,
        meta: {
          totalEntries: globalLeaderboard.length,
          totalUsers,
          totalGamesPlayed,
          averageLevel,
          sortBy,
          period,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
