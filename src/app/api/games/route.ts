import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

/**
 * GET /api/games
 * Public endpoint to fetch all available games
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const games = await Game.find({})
      .select('-__v')
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      data: games,
      count: games.length,
    });
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * POST /api/games
 * Protected endpoint to create a new game (admin only)
 * Note: This would typically require admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await req.json();
    
    await dbConnect();

    const { slug, title, description, tags, difficulty, controls } = body;

    // Validate required fields
    if (!slug || !title || !description || !difficulty) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: slug, title, description, difficulty',
      }, { status: 400 });
    }

    // Check if game with this slug already exists
    const existingGame = await Game.findOne({ slug });
    if (existingGame) {
      return NextResponse.json({
        success: false,
        error: 'Game with this slug already exists',
      }, { status: 409 });
    }

    const game = new Game({
      slug,
      title,
      description,
      tags: tags || [],
      difficulty,
      controls: controls || [],
    });

    await game.save();

    return NextResponse.json({
      success: true,
      data: game,
      message: 'Game created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
