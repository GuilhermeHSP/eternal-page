import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { TributeViewer } from '@/components/tribute/tribute-viewer';
import { TributeConfig } from '@/types/tribute';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const tribute = await db.tribute.findUnique({
      where: { slug },
    });

    if (!tribute) {
      return { title: 'Homenagem não encontrada' };
    }

    const config = JSON.parse(tribute.config) as TributeConfig;
    const heroImage = config.hero?.image || tribute.heroImage;

    return {
      title: tribute.title,
      description: `Uma homenagem para ${tribute.recipient}`,
      openGraph: {
        title: tribute.title,
        description: `Uma homenagem para ${tribute.recipient}`,
        images: heroImage ? [{ url: heroImage }] : [],
        type: 'website',
      },
    };
  } catch (e) {
    console.error('Error in generateMetadata:', e);
    return { title: 'Homenagem' };
  }
}

export default async function TributePage({ params }: PageProps) {
  const { slug } = await params;
  
  let tribute;
  try {
    tribute = await db.tribute.findUnique({
      where: { slug },
      include: {
        photos: { orderBy: { order: 'asc' } },
        timeline: { orderBy: { order: 'asc' } },
      },
    });
  } catch (e) {
    console.error('Error fetching tribute:', e);
    notFound();
  }

  if (!tribute) {
    notFound();
  }

  // Increment view count (non-blocking)
  db.tribute.update({
    where: { id: tribute.id },
    data: { viewCount: { increment: 1 } },
  }).catch((e) => console.error('Failed to increment view count:', e));

  return <TributeViewer config={buildConfig(tribute)} slug={tribute.slug} />;
}

type TributeWithRelations = Prisma.TributeGetPayload<{ include: { photos: true; timeline: true } }>;

// Seeded tributes store the whole page in `config`; pages made in the creator keep their content
// in the columns and relations (and only message/closing in `config`), so build it from those.
function buildConfig(tribute: TributeWithRelations): TributeConfig {
  let stored: Partial<TributeConfig> = {};
  try {
    stored = JSON.parse(tribute.config) || {};
  } catch {
    // ignore malformed config
  }
  if (typeof stored.title === 'string' && typeof stored.template === 'string') {
    return stored as TributeConfig;
  }

  return {
    title: tribute.title,
    recipient: tribute.recipient,
    template: tribute.templateId,
    hero: tribute.heroImage ? { image: tribute.heroImage, overlay: true } : undefined,
    music: tribute.musicUrl ? { url: tribute.musicUrl, autoplay: false } : undefined,
    message: tribute.message ? { text: tribute.message } : undefined,
    gallery: tribute.photos.map((p, i) => ({
      id: p.id,
      url: p.url,
      caption: p.caption ?? undefined,
      order: p.order ?? i,
    })),
    timeline: tribute.timeline.map((t, i) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? undefined,
      year: t.year ?? undefined,
      imageUrl: t.imageUrl ?? undefined,
      order: t.order ?? i,
    })),
    closingMessage: tribute.closingMessage ?? undefined,
  };
}
