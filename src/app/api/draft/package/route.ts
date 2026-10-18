import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PACKAGES } from '@/lib/packages';

// Switches the plan of an unpaid draft from the preview or the checkout, without going back to
// the editor. Moving up to Completo also turns the envelope opening on (Básico pages are saved
// without it). Moving down to Básico is only allowed when the page already fits it, so content
// built on Completo can't be published for the Básico price.
export async function POST(request: NextRequest) {
  let body: { draftId?: unknown; packageType?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }
  const draftId = typeof body.draftId === 'string' ? body.draftId : '';
  const target = body.packageType === 'basic' ? 'basic' : body.packageType === 'premium' ? 'premium' : null;
  if (!draftId || !target) return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });

  const tribute = await db.tribute.findUnique({
    where: { id: draftId },
    include: { _count: { select: { photos: true } }, timeline: { select: { imageUrl: true } } },
  });
  if (!tribute) return NextResponse.json({ error: 'Homenagem não encontrada.' }, { status: 404 });
  if (tribute.isPublished && tribute.paidAt) {
    return NextResponse.json({ error: 'Esta homenagem já foi paga.' }, { status: 409 });
  }

  let config: Record<string, unknown> = {};
  try {
    config = JSON.parse(tribute.config) || {};
  } catch {
    // keep an empty config
  }

  if (target === 'basic') {
    const limits = PACKAGES.basic.limits;
    const fits =
      tribute._count.photos <= limits.momentsPhotos &&
      tribute.timeline.length <= limits.timelineMoments &&
      !tribute.timeline.some((t) => t.imageUrl) &&
      !tribute.musicUrl &&
      !config.voiceMessage;
    if (!fits) {
      return NextResponse.json(
        {
          error: `O Básico aceita até ${limits.momentsPhotos} fotos e ${limits.timelineMoments} momentos sem foto, sem música nem voz. Toque em Editar para ajustar a página.`,
        },
        { status: 409 }
      );
    }
    config.envelope = false;
  } else if (tribute.packageType === 'basic') {
    delete config.envelope;
  }

  await db.tribute.update({
    where: { id: tribute.id },
    data: { packageType: target, config: JSON.stringify(config) },
  });
  return NextResponse.json({ packageType: target });
}
