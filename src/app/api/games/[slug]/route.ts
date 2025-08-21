import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

/**
 * GET /api/games/[slug]
 * Public endpoint to fetch detailed information for a single game
 */
export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    
    await dbConnect();

    const game = await Game.findOne({ slug })
      .select('-__v')
      .exec();

    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * PUT /api/games/[slug]
 * Protected endpoint to update game information (admin only)
 */
export async function PUT(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // TODO: Add admin authentication check
    const { slug } = context.params;
    const body = await req.json();
    
    await dbConnect();

    // Validate allowed fields
    const allowedFields = ['title', 'description', 'tags', 'difficulty', 'controls'];
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

    const game = await Game.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: game,
      message: 'Game updated successfully',
    });
  } catch (error) {
    console.error('Update game error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/games/[slug]
 * Protected endpoint to delete a game (admin only)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // TODO: Add admin authentication check
    const { slug } = context.params;
    
    await dbConnect();

    const game = await Game.findOneAndDelete({ slug });

    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Delete game error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
