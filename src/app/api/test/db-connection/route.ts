import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection, getDatabaseInfo } from '@/lib/database-utils';

/**
 * Test database connection endpoint
 * GET /api/test/db-connection
 */
export async function GET() {
  try {
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      const dbInfo = await getDatabaseInfo();
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        data: dbInfo,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
