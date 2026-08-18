import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      cluster: 'TutorNovaCluster',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error?.message || 'Failed to connect to database',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
