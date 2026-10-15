import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { isTributeLive } from '@/lib/tribute-access';
import { siteUrl } from '@/lib/site';

// QR code image of a published tribute's address, shown inside the delivery e-mail
// (e-mail apps block images embedded as data URLs, so it needs a real address).

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const tribute = await db.tribute.findUnique({ where: { slug }, select: { slug: true, isPublished: true, expiresAt: true } });
  if (!tribute || !isTributeLive(tribute)) return new NextResponse('Not found', { status: 404 });

  const png = await QRCode.toBuffer(`${siteUrl()}/${tribute.slug}`, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
