import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isTributeLive } from '@/lib/tribute-access';

// Message wall of a published tribute: anyone with the link can read it and leave a message,
// if the creator turned the wall on.

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function findOpenWall(slug: string) {
  const tribute = await db.tribute.findUnique({ where: { slug }, select: { id: true, isPublished: true, expiresAt: true, config: true } });
  if (!tribute || !isTributeLive(tribute)) return null;
  try {
    const config = JSON.parse(tribute.config) as { guestbook?: boolean };
    return config.guestbook ? tribute : null;
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const tribute = await findOpenWall(slug);
  if (!tribute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await db.guestMessage.findMany({
    where: { tributeId: tribute.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, name: true, message: true, createdAt: true },
  });
  return NextResponse.json({ messages });
}

// A small in-memory throttle per address: one message every 20 seconds.
const lastPostAt = new Map<string, number>();

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const tribute = await findOpenWall(slug);
  if (!tribute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { name?: unknown; message?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Honeypot field: people never fill it, bots usually do.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 400) : '';
  if (!name || !message) {
    return NextResponse.json({ error: 'Nome e mensagem são obrigatórios.' }, { status: 400 });
  }

  const key = `${slug}:${request.headers.get('x-forwarded-for') ?? 'local'}`;
  const now = Date.now();
  if (now - (lastPostAt.get(key) ?? 0) < 20_000) {
    return NextResponse.json({ error: 'Aguarde alguns segundos para enviar outra mensagem.' }, { status: 429 });
  }
  lastPostAt.set(key, now);

  const created = await db.guestMessage.create({
    data: { tributeId: tribute.id, name, message },
    select: { id: true, name: true, message: true, createdAt: true },
  });
  return NextResponse.json({ message: created }, { status: 201 });
}
