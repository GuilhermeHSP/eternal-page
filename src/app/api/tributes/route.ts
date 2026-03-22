import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TributeConfig } from '@/types/tribute';
import { templates, getTemplate } from '@/lib/templates';
import { nanoid } from 'nanoid';

// Generate a URL-friendly slug from title and recipient
function generateSlug(title: string, recipient: string): string {
  const base = `${title}-${recipient}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
  
  const uniqueId = nanoid(6);
  return `${base}-${uniqueId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      recipient,
      templateId,
      message,
      heroImage,
      musicUrl,
      photos = [],
      timeline = [],
      closingMessage,
    } = body;

    // Validate required fields
    if (!title || !recipient || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get template
    const template = getTemplate(templateId) || templates.romantic;

    // Build tribute config
    const config: TributeConfig = {
      title,
      recipient,
      template: templateId,
      hero: heroImage ? { image: heroImage } : undefined,
      music: musicUrl ? { url: musicUrl, autoplay: true } : undefined,
      message: message ? {
        text: message,
        typingAnimation: true,
        highlightPhrases: extractHighlightPhrases(message),
      } : undefined,
      gallery: photos.map((p: { url: string; caption?: string }, i: number) => ({
        id: `photo-${i}`,
        url: p.url,
        caption: p.caption,
        order: i,
      })),
      timeline: timeline.map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
        id: `timeline-${i}`,
        title: t.title,
        description: t.description,
        year: t.year,
        imageUrl: t.imageUrl,
        order: i,
      })),
      closingMessage,
      createdAt: new Date().toISOString(),
    };

    // Generate slug
    const slug = generateSlug(title, recipient);

    // Create tribute in database
    const tribute = await db.tribute.create({
      data: {
        slug,
        title,
        recipient,
        config: JSON.stringify(config),
        templateId,
        heroImage,
        musicUrl,
        closingMessage,
        isPublished: true,
        photos: {
          create: photos.map((p: { url: string; caption?: string }, i: number) => ({
            url: p.url,
            caption: p.caption,
            order: i,
          })),
        },
        timeline: {
          create: timeline
            .filter((t: { title: string }) => t.title)
            .map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
              title: t.title,
              description: t.description,
              year: t.year,
              imageUrl: t.imageUrl,
              order: i,
            })),
        },
      },
    });

    return NextResponse.json({
      id: tribute.id,
      slug: tribute.slug,
      title: tribute.title,
      recipient: tribute.recipient,
    });
  } catch (error) {
    console.error('Error creating tribute:', error);
    return NextResponse.json(
      { error: 'Failed to create tribute' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get single tribute
      const tribute = await db.tribute.findUnique({
        where: { slug },
        include: {
          photos: { orderBy: { order: 'asc' } },
          timeline: { orderBy: { order: 'asc' } },
        },
      });

      if (!tribute) {
        return NextResponse.json({ error: 'Tribute not found' }, { status: 404 });
      }

      // Increment view count
      await db.tribute.update({
        where: { id: tribute.id },
        data: { viewCount: { increment: 1 } },
      });

      return NextResponse.json({
        ...tribute,
        config: JSON.parse(tribute.config),
      });
    }

    // Get all tributes
    const tributes = await db.tribute.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(tributes);
  } catch (error) {
    console.error('Error fetching tribute:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tribute' },
      { status: 500 }
    );
  }
}

// Extract highlighted phrases from markdown-style text
function extractHighlightPhrases(text: string): string[] {
  const matches = text.match(/\*\*(.*?)\*\*/g) || [];
  return matches.map(m => m.replace(/\*\*/g, ''));
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tribute ID is required' },
        { status: 400 }
      );
    }

    // Delete photos and timeline items first (cascade)
    await db.photo.deleteMany({
      where: { tributeId: id },
    });

    await db.timelineItem.deleteMany({
      where: { tributeId: id },
    });

    // Delete the tribute
    await db.tribute.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tribute:', error);
    return NextResponse.json(
      { error: 'Failed to delete tribute' },
      { status: 500 }
    );
  }
}
