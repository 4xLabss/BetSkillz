import { NextRequest, NextResponse } from 'next/server';
import { withOwnership, getWalletFromParams } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/users/[walletAddress]
 * Public endpoint to fetch profile data for any user
 */
export async function GET(
  req: NextRequest,
  context: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = context.params;
    
    await dbConnect();

    const user = await User.findOne({ walletAddress })
      .populate('achievements')
      .select('-__v') // Exclude version key
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
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * PUT /api/users/[walletAddress]
 * Protected endpoint for users to update their own profile
 * Requires ownership verification
 */
export const PUT = withOwnership(
  async (req: NextRequest, context: { params: { walletAddress: string } }) => {
    try {
      const { walletAddress } = context.params;
      const body = await req.json();
      
      await dbConnect();

      // Validate allowed fields
      const allowedFields = ['username', 'avatar'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No valid fields to update',
        }, { status: 400 });
      }

      // Check if username is unique (if being updated)
      if (updateData.username) {
        const existingUser = await User.findOne({ 
          username: updateData.username,
          walletAddress: { $ne: walletAddress }
        });
        
        if (existingUser) {
          return NextResponse.json({
            success: false,
            error: 'Username already taken',
          }, { status: 409 });
        }
      }

      const user = await User.findOneAndUpdate(
        { walletAddress },
        updateData,
        { new: true, runValidators: true }
      ).populate('achievements');

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          avatar: user.avatar,
          level: user.level,
          xp: user.xp,
          stats: user.stats,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 });
    }
  },
  getWalletFromParams
);
