import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { db } from '@/lib/db-supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const items = await db.getWishlistItemsByUser(session.userId);

    return NextResponse.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        itemId: item.itemId,
        itemData: item.itemData,
        createdAt: item.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get wishlist' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, itemData } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId' },
        { status: 400 }
      );
    }

    const existing = await db.getWishlistItemByUserAndItemId(session.userId, itemId);
    if (existing) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    const item = await db.createWishlistItem({
      userId: session.userId,
      itemId,
      itemData
    });

    const user = await db.getUser(session.userId);
    if (user) {
      await db.createAnalyticsEvent({
        projectId: user.projectId,
        eventType: 'wishlist_add',
        userId: user.id,
        metadata: { itemId }
      });
    }

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        itemId: item.itemId,
        itemData: item.itemData,
        createdAt: item.createdAt
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add to wishlist' },
      { status: 400 }
    );
  }
}
