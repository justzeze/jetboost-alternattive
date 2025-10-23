import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.getProject(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const stats = await db.getAnalyticsStats(id);

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 400 }
    );
  }
}
