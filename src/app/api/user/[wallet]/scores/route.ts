import { NextRequest, NextResponse } from 'next/server';
import { withOwnership, getWalletFromWalletParams } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import { Score, User, Game } from '@/models';

/**
 * GET /api/user/[wallet]/scores
 * Get scores for a specific user's wallet (with ownership protection)
 */
export const GET = withOwnership(
  async (req: NextRequest, context: { params: { wallet: string } }) => {
    try {
      const { wallet: walletAddress } = context.params;
      const url = new URL(req.url);
      const gameSlug = url.searchParams.get('game');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

      await dbConnect();

      // Build query
      const query: any = { user: await User.findOne({ walletAddress }).select('_id') };
      
      if (gameSlug) {
        const game = await Game.findOne({ slug: gameSlug });
        if (!game) {
          return NextResponse.json({
            success: false,
            error: 'Game not found',
          }, { status: 404 });
        }
        query.game = game._id;
      }

      // Get total count
      const total = await Score.countDocuments(query);

      // Get scores with pagination
      const scores = await Score.find(query)
        .populate('game', 'title slug')
        .sort({ score: -1, createdAt: -1 })
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
      console.error('Get user scores error:', error);
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 });
    }
  },
  getWalletFromWalletParams
);

/**
 * POST /api/user/[wallet]/scores
 * Submit a new score for the user (with ownership protection)
 */
export const POST = withOwnership(
  async (req: NextRequest, context: { params: { wallet: string } }) => {
    try {
      const { wallet: walletAddress } = context.params;
      const body = await req.json();
      const { gameSlug, score } = body;

      if (!gameSlug || typeof score !== 'number' || score < 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid game slug or score',
        }, { status: 400 });
      }

      await dbConnect();

      // Find user and game
      const [user, game] = await Promise.all([
        User.findOne({ walletAddress }),
        Game.findOne({ slug: gameSlug }),
      ]);

      if (!user || !game) {
        return NextResponse.json({
          success: false,
          error: 'User or game not found',
        }, { status: 404 });
      }

      // Create new score
      const newScore = new Score({
        user: user._id,
        game: game._id,
        score,
      });

      await newScore.save();

      // Update user stats
      const userStats = user.stats;
      userStats.gamesPlayed += 1;
      userStats.totalScore += score;

      // Calculate new win rate (this is a simplified example)
      // In a real game, you'd define what constitutes a "win"
      const allUserScores = await Score.find({ user: user._id, game: game._id });
      const averageScore = allUserScores.reduce((sum, s) => sum + s.score, 0) / allUserScores.length;
      userStats.winRate = score > averageScore ? 
        Math.min(userStats.winRate + 0.01, 1) : 
        Math.max(userStats.winRate - 0.01, 0);

      await user.save();

      return NextResponse.json({
        success: true,
        data: {
          id: newScore._id,
          score: newScore.score,
          game: {
            title: game.title,
            slug: game.slug,
          },
          createdAt: newScore.createdAt,
        },
      });
    } catch (error) {
      console.error('Submit score error:', error);
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 });
    }
  },
  getWalletFromWalletParams
);
