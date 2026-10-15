import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { isValidHex, styleForColor } from '@/lib/colors';
import { getPackage, type PackageType } from '@/lib/packages';
import { MediaError, normaliseMedia } from '@/lib/storage';

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
      isPaid: tribute.isPublished && !!tribute.paidAt,
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
      counterDate,
      counterLabel,
      reasons,
      voiceMessage,
      guestbook,
      authorName,
      musicTitle,
      envelope,
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

    // After payment the package is fixed to the one paid for (no free upgrade by editing).
    const existing = draftId ? await db.tribute.findUnique({ where: { id: draftId } }) : null;
    if (draftId && !existing) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }
    const isPaid = !!existing && existing.isPublished && !!existing.paidAt;
    const requestedPackage: PackageType = packageType === 'premium' ? 'premium' : packageType === 'plus' ? 'plus' : 'basic';
    const effectivePackage: PackageType = isPaid
      ? ((existing!.paidPackage as PackageType) || (existing!.packageType as PackageType) || 'premium')
      : requestedPackage;
    // The package limits are checked here too, not only in the creator.
    const limits = getPackage(effectivePackage).limits;
    // Photos, music and voice arrive as data URLs from the creator; they are stored as files
    // (Cloudflare R2, or public/uploads in development) and only their address is saved.
    let storedHero: string | null;
    let allowedPhotos: { url: string; caption?: string }[];
    let allowedTimeline: { title: string; description?: string; year?: string; imageUrl?: string }[];
    let allowedMusicUrl: string | null;
    let storedVoice: string | null;
    try {
      storedHero = await normaliseMedia(heroImage, 'image');
      allowedPhotos = [];
      for (const p of (Array.isArray(photos) ? photos : []).slice(0, limits.momentsPhotos)) {
        const url = await normaliseMedia(p?.url, 'image');
        if (url) allowedPhotos.push({ url, caption: typeof p.caption === 'string' ? p.caption : undefined });
      }
      allowedTimeline = [];
      for (const t of (Array.isArray(timeline) ? timeline : []).slice(0, limits.timelineMoments)) {
        allowedTimeline.push({
          ...t,
          imageUrl: limits.timelineImages ? (await normaliseMedia(t?.imageUrl, 'image')) ?? undefined : undefined,
        });
      }
      allowedMusicUrl = limits.music ? await normaliseMedia(musicUrl, 'audio') : null;
      storedVoice = limits.music ? await normaliseMedia(voiceMessage, 'audio') : null;
    } catch (e) {
      if (e instanceof MediaError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }

    // Build config JSON
    const voice = storedVoice || undefined;

    // A colour the person picked overrides the template's own
    const config = {
      message: message || null,
      closingMessage: closingMessage || null,
      ...(isValidHex(accentColor) ? { style: styleForColor(accentColor) } : {}),
      ...(typeof counterDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(counterDate)
        ? { counter: { date: counterDate, label: typeof counterLabel === 'string' ? counterLabel.slice(0, 40) : undefined } }
        : {}),
      ...(voice ? { voiceMessage: voice } : {}),
      ...(guestbook === true ? { guestbook: true } : {}),
      ...(typeof authorName === 'string' && authorName.trim() ? { authorName: authorName.trim().slice(0, 50) } : {}),
      ...(typeof musicTitle === 'string' && musicTitle.trim() ? { musicTitle: musicTitle.trim().slice(0, 80) } : {}),
      ...(envelope === false || !limits.envelope ? { envelope: false } : {}),
      ...(Array.isArray(reasons) && reasons.some((r: unknown) => typeof r === 'string' && r.trim())
        ? {
            reasons: reasons
              .filter((r: unknown): r is string => typeof r === 'string' && !!r.trim())
              .slice(0, 12)
              .map((r: string) => r.trim().slice(0, 160)),
          }
        : {}),
    };

    // Generate slug if creating new draft
    const slug = nanoid(10);

    if (draftId) {
      // Update existing draft
      const updatedTribute = await db.tribute.update({
        where: { id: draftId },
        data: {
          title,
          recipient,
          templateId,
          message,
          closingMessage: closingMessage || null,
          config: JSON.stringify(config),
          heroImage: storedHero,
          musicUrl: allowedMusicUrl || null,
          packageType: effectivePackage,
        },
      });

      // Delete existing photos and timeline items
      await db.photo.deleteMany({ where: { tributeId: draftId } });
      await db.timelineItem.deleteMany({ where: { tributeId: draftId } });

      // Create new photos
      if (allowedPhotos.length > 0) {
        await db.photo.createMany({
          data: allowedPhotos.map((p: { url: string; caption?: string }, i: number) => ({
            tributeId: draftId,
            url: p.url,
            caption: p.caption || null,
            order: i,
          })),
        });
      }

      // Create new timeline items
      if (allowedTimeline.length > 0) {
        await db.timelineItem.createMany({
          data: allowedTimeline.map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
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
          heroImage: storedHero,
          musicUrl: allowedMusicUrl || null,
          packageType: effectivePackage,
          isPublished: false,
        },
      });

      // Create photos
      if (allowedPhotos.length > 0) {
        await db.photo.createMany({
          data: allowedPhotos.map((p: { url: string; caption?: string }, i: number) => ({
            tributeId: newTribute.id,
            url: p.url,
            caption: p.caption || null,
            order: i,
          })),
        });
      }

      // Create timeline items
      if (allowedTimeline.length > 0) {
        await db.timelineItem.createMany({
          data: allowedTimeline.map((t: { title: string; description?: string; year?: string; imageUrl?: string }, i: number) => ({
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

// Publishing happens only after Mercado Pago approves the payment (see lib/fulfillment.ts).
