import { NextRequest, NextResponse } from 'next/server';
import { withOwnership, getWalletFromParams } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import { User, Achievement } from '@/models';

/**
 * POST /api/users/[walletAddress]/achievements
 * Protected, server-internal endpoint for awarding an achievement to a user
 * This should be secured with a secret key to prevent unauthorized awarding
 */
export const POST = async (
  req: NextRequest,
  context: { params: { walletAddress: string } }
) => {
  try {
    // Server-to-server authentication check
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid internal API token',
      }, { status: 401 });
    }

    const { walletAddress } = context.params;
    const body = await req.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json({
        success: false,
        error: 'Achievement ID is required',
      }, { status: 400 });
    }

    await dbConnect();

    // Find user and achievement
    const [user, achievement] = await Promise.all([
      User.findOne({ walletAddress }),
      Achievement.findOne({ achievementId }),
    ]);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    if (!achievement) {
      return NextResponse.json({
        success: false,
        error: 'Achievement not found',
      }, { status: 404 });
    }

    // Check if user already has this achievement
    const hasAchievement = user.achievements.some(
      (id: any) => id.toString() === achievement._id.toString()
    );

    if (hasAchievement) {
      return NextResponse.json({
        success: false,
        error: 'User already has this achievement',
      }, { status: 409 });
    }

    // Award the achievement using $addToSet to prevent duplicates
    await User.findOneAndUpdate(
      { walletAddress },
      { $addToSet: { achievements: achievement._id } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          username: user.username,
        },
        achievement: {
          id: achievement._id,
          achievementId: achievement.achievementId,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        },
        awardedAt: new Date(),
      },
      message: 'Achievement awarded successfully',
    });
  } catch (error) {
    console.error('Award achievement error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
};

/**
 * GET /api/users/[walletAddress]/achievements
 * Public endpoint to get user's achievements
 */
export async function GET(
  req: NextRequest,
  context: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = context.params;
    
    await dbConnect();

    const user = await User.findOne({ walletAddress })
      .populate({
        path: 'achievements',
        select: '-__v',
      })
      .select('username walletAddress achievements')
      .exec();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          username: user.username,
          walletAddress: user.walletAddress,
        },
        achievements: user.achievements,
        meta: {
          totalAchievements: user.achievements.length,
        },
      },
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[walletAddress]/achievements
 * Protected endpoint to remove an achievement from a user (admin only)
 */
export const DELETE = async (
  req: NextRequest,
  context: { params: { walletAddress: string } }
) => {
  try {
    // Server-to-server authentication check
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid internal API token',
      }, { status: 401 });
    }

    const { walletAddress } = context.params;
    const body = await req.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json({
        success: false,
        error: 'Achievement ID is required',
      }, { status: 400 });
    }

    await dbConnect();

    // Find achievement to get its ObjectId
    const achievement = await Achievement.findOne({ achievementId });
    if (!achievement) {
      return NextResponse.json({
        success: false,
        error: 'Achievement not found',
      }, { status: 404 });
    }

    // Remove achievement from user
    const result = await User.findOneAndUpdate(
      { walletAddress },
      { $pull: { achievements: achievement._id } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement removed successfully',
    });
  } catch (error) {
    console.error('Remove achievement error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
};
