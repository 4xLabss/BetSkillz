import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import { User, Game, Score } from '@/models';
import mongoose from 'mongoose';

/**
 * POST /api/scores
 * Protected endpoint for submitting a player's score after a game session
 * This is the central hub of the gaming loop
 */
export const POST = withAuth(async (req: NextRequest) => {
  let session: mongoose.ClientSession | null = null;
  
  try {
    const authSession = (req as any).session;
    const body = await req.json();
    const { gameSlug, score } = body;

    // Validate input
    if (!gameSlug || typeof score !== 'number' || score < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid gameSlug or score. Score must be a non-negative number.',
      }, { status: 400 });
    }

    await dbConnect();
    session = await mongoose.startSession();
    await session.startTransaction();

    // Find user and game
    const [user, game] = await Promise.all([
      User.findOne({ walletAddress: authSession.user.walletAddress }).session(session),
      Game.findOne({ slug: gameSlug }).session(session),
    ]);

    if (!user) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    if (!game) {
      await session.abortTransaction();
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    // Create new score document
    const newScore = new Score({
      user: user._id,
      game: game._id,
      score,
    });

    await newScore.save({ session });

    // Update user stats in transaction
    const userStats = user.stats;
    const previousGamesPlayed = userStats.gamesPlayed;
    const previousTotalScore = userStats.totalScore;
    const previousAvgGameTime = userStats.avgGameTime;

    // Update stats
    userStats.gamesPlayed += 1;
    userStats.totalScore += score;

    // Calculate new win rate (simplified: score above user's average is a "win")
    const userAvgScore = previousGamesPlayed > 0 ? previousTotalScore / previousGamesPlayed : 0;
    if (score > userAvgScore) {
      userStats.winRate = Math.min((userStats.winRate * previousGamesPlayed + 1) / userStats.gamesPlayed, 1);
    } else {
      userStats.winRate = (userStats.winRate * previousGamesPlayed) / userStats.gamesPlayed;
    }

    // Update average game time (mock calculation - in real app, you'd track actual time)
    const mockGameTime = Math.random() * 300 + 60; // 1-6 minutes
    userStats.avgGameTime = (previousAvgGameTime * previousGamesPlayed + mockGameTime) / userStats.gamesPlayed;

    // Calculate XP gain (simple formula: score / 10 + base XP)
    const xpGain = Math.floor(score / 10) + 10;
    user.xp += xpGain;

    // Check for level up (every 1000 XP)
    const newLevel = Math.floor(user.xp / 1000) + 1;
    const leveledUp = newLevel > user.level;
    if (leveledUp) {
      user.level = newLevel;
    }

    await user.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate the score with user and game data for response
    await newScore.populate([
      { path: 'user', select: 'username walletAddress level' },
      { path: 'game', select: 'title slug' }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        score: {
          id: newScore._id,
          score: newScore.score,
          user: newScore.user,
          game: newScore.game,
          createdAt: newScore.createdAt,
        },
        userStats: {
          level: user.level,
          xp: user.xp,
          xpGained: xpGain,
          leveledUp,
          stats: user.stats,
        },
      },
      message: 'Score submitted successfully',
    }, { status: 201 });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Submit score error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

/**
 * GET /api/scores
 * Public endpoint to get recent scores with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const gameSlug = url.searchParams.get('game');
    const walletAddress = url.searchParams.get('user');

    await dbConnect();

    // Build query
    const query: any = {};
    
    if (gameSlug) {
      const game = await Game.findOne({ slug: gameSlug }).select('_id');
      if (!game) {
        return NextResponse.json({
          success: false,
          error: 'Game not found',
        }, { status: 404 });
      }
      query.game = game._id;
    }

    if (walletAddress) {
      const user = await User.findOne({ walletAddress }).select('_id');
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
        }, { status: 404 });
      }
      query.user = user._id;
    }

    // Get total count
    const total = await Score.countDocuments(query);

    // Get scores with pagination
    const scores = await Score.find(query)
      .populate('user', 'username walletAddress avatar level')
      .populate('game', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({
      success: true,
      data: scores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get scores error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
