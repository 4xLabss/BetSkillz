import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/user/profile
 * Get the authenticated user's profile
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const session = (req as any).session;
    await dbConnect();

    const user = await User.findOne({ walletAddress: session.user.walletAddress })
      .populate('achievements')
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
    console.error('Get profile error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
});

/**
 * PUT /api/user/profile
 * Update the authenticated user's profile
 */
export const PUT = withAuth(async (req: NextRequest) => {
  try {
    const session = (req as any).session;
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
        walletAddress: { $ne: session.user.walletAddress }
      });
      
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Username already taken',
        }, { status: 409 });
      }
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: session.user.walletAddress },
      updateData,
      { new: true, runValidators: true }
    );

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
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
});
