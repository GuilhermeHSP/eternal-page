import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { isValidHex, styleForColor } from '@/lib/colors';

// GET - Retrieve a draft by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const tribute = await db.tribute.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: 'asc' } },
        timeline: { orderBy: { order: 'asc' } },
      },
    });

    if (!tribute) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Parse config JSON
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(tribute.config) || {};
    } catch {
      // Ignore parse errors
    }

    return NextResponse.json({
      id: tribute.id,
      slug: tribute.slug,
      title: tribute.title,
      recipient: tribute.recipient,
      message: tribute.message,
      templateId: tribute.templateId,
      heroImage: tribute.heroImage,
      musicUrl: tribute.musicUrl,
      packageType: tribute.packageType || 'basic',
      closingMessage: tribute.closingMessage || null,
      config,
      photos: tribute.photos,
      timeline: tribute.timeline,
      isPublished: tribute.isPublished,
      isPremium: tribute.isPremium,
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

// POST - Create or update a draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      draftId,
      title,
      recipient,
      templateId,
      message,
      heroImage,
      musicUrl,
      packageType,
      closingMessage,
      accentColor,
      photos = [],
      timeline = [],
    } = body;

    // Validate required fields
    if (!title || !recipient || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, recipient, templateId' },
        { status: 400 }
      );
    }

    // Build config JSON
    // A colour the person picked overrides the template's own
    const config = {
      message: message || null,
      closingMessage: closingMessage || null,
      ...(isValidHex(accentColor) ? { style: styleForColor(accentColor) } : {}),
    };

    // Generate slug if creating new draft
    const slug = nanoid(10);

    if (draftId) {
      // Update existing draft
      const existingTribute = await db.tribute.findUnique({
        where: { id: draftId },
      });

      if (!existingTribute) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      // Update tribute
      const updatedTribute = await db.tribute.update({
        where: { id: draftId },
        data: {
          title,
          recipient,
          templateId,
          message,
          closingMessage: closingMessage || null,
          config: JSON.stringify(config),
          heroImage: heroImage || null,
          musicUrl: musicUrl || null,
          packageType: packageType || 'basic',
        },
      });

      // Delete existing photos and timeline items
      await db.photo.deleteMany({ where: { tributeId: draftId } });
      await db.timelineItem.deleteMany({ where: { tributeId: draftId } });

      // Create new photos
      if (photos.length > 0) {
        await db.photo.createMany({
          data: photos.map((p: { url: string; caption?: string }, i: number) => ({
            tributeId: draftId,
            url: p.url,
            caption: p.caption || null,
            order: i,
          })),
        });
      }

      // Create new timeline items
      if (timeline.length > 0) {
        await db.timelineItem.createMany({
          data: timeline.map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
            tributeId: draftId,
            title: t.title,
            description: t.description || null,
            year: t.year || null,
            imageUrl: t.imageUrl || null,
            order: i,
          })),
        });
      }

      return NextResponse.json({ id: draftId, slug: updatedTribute.slug });
    } else {
      // Create new draft
      const newTribute = await db.tribute.create({
        data: {
          slug,
          title,
          recipient,
          templateId,
          message,
          closingMessage: closingMessage || null,
          config: JSON.stringify(config),
          heroImage: heroImage || null,
          musicUrl: musicUrl || null,
          packageType: packageType || 'basic',
          isPublished: false,
        },
      });

      // Create photos
      if (photos.length > 0) {
        await db.photo.createMany({
          data: photos.map((p: { url: string; caption?: string }, i: number) => ({
            tributeId: newTribute.id,
            url: p.url,
            caption: p.caption || null,
            order: i,
          })),
        });
      }

      // Create timeline items
      if (timeline.length > 0) {
        await db.timelineItem.createMany({
          data: timeline.map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
            tributeId: newTribute.id,
            title: t.title,
            description: t.description || null,
            year: t.year || null,
            imageUrl: t.imageUrl || null,
            order: i,
          })),
        });
      }

      return NextResponse.json({ id: newTribute.id, slug: newTribute.slug });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

// PUT - Update draft status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
    }

    const tribute = await db.tribute.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json({ success: true, id: tribute.id, isPublished: tribute.isPublished });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}
