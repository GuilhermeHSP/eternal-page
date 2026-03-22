import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PackageType } from '@/lib/packages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, packageType } = body;

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Get the draft
    const draft = await db.tribute.findUnique({
      where: { id: draftId },
      include: {
        photos: { orderBy: { order: 'asc' } },
        timeline: { orderBy: { order: 'asc' } },
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Update to published status
    const updatedTribute = await db.tribute.update({
      where: { id: draftId },
      data: {
        isPublished: true,
        isPremium: packageType === 'premium',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updatedTribute.id,
      slug: updatedTribute.slug,
      isPublished: updatedTribute.isPublished,
    });
  } catch (error) {
    console.error('Error finalizing tribute:', error);
    return NextResponse.json(
      { error: 'Failed to finalize tribute' },
      { status: 500 }
    );
  }
}
