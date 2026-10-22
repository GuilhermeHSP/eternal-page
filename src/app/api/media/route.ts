import { NextRequest, NextResponse } from 'next/server';
import { MAX_AUDIO_BYTES, MediaError, storeBytes, type MediaKind } from '@/lib/storage';

// One photo or audio file at a time, sent as raw bytes by the creator before "Gerar prévia" saves
// the draft. Sending everything inside the draft's JSON made a single request of 15 MB or more,
// which phones on mobile data (Safari on iPhone above all) often dropped before it finished.
export async function POST(request: NextRequest) {
  const kind: MediaKind | null = (() => {
    const k = new URL(request.url).searchParams.get('kind');
    return k === 'image' || k === 'audio' ? k : null;
  })();
  if (!kind) {
    return NextResponse.json({ error: 'Tipo de arquivo inválido.' }, { status: 400 });
  }

  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_AUDIO_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'O arquivo é grande demais.' }, { status: 413 });
  }

  try {
    const bytes = Buffer.from(await request.arrayBuffer());
    const url = await storeBytes(request.headers.get('content-type') || '', bytes, kind);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof MediaError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error('Error storing media:', e);
    return NextResponse.json({ error: 'Não foi possível salvar o arquivo.' }, { status: 500 });
  }
}
