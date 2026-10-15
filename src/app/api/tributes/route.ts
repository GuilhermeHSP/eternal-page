import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { isTributeLive } from '@/lib/tribute-access';

// Tributes are created through /api/draft and published only after payment (lib/fulfillment.ts).
// This route serves the admin page (list and delete, behind ADMIN_PASSWORD) and reads a
// published tribute by slug.

function isAdmin(request: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const tribute = await db.tribute.findUnique({
        where: { slug },
        include: {
          photos: { orderBy: { order: 'asc' } },
          timeline: { orderBy: { order: 'asc' } },
        },
      });

      if (!tribute || !isTributeLive(tribute)) {
        return NextResponse.json({ error: 'Tribute not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: tribute.id,
        slug: tribute.slug,
        title: tribute.title,
        recipient: tribute.recipient,
        templateId: tribute.templateId,
        config: JSON.parse(tribute.config),
        photos: tribute.photos,
        timeline: tribute.timeline,
      });
    }

    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tributes = await db.tribute.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        recipient: true,
        templateId: true,
        isPublished: true,
        viewCount: true,
        createdAt: true,
        packageType: true,
        paidPackage: true,
        paidAmount: true,
        paidAt: true,
        paymentStatus: true,
        buyerEmail: true,
        expiresAt: true,
      },
    });

    return NextResponse.json(tributes);
  } catch (error) {
    console.error('Error fetching tribute:', error);
    return NextResponse.json({ error: 'Failed to fetch tribute' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tribute ID is required' }, { status: 400 });
    }

    // Photos, timeline items and guest messages go with it (onDelete: Cascade).
    await db.tribute.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tribute:', error);
    return NextResponse.json({ error: 'Failed to delete tribute' }, { status: 500 });
  }
}
