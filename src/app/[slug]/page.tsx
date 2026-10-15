import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getPackage, type PackageType } from '@/lib/packages';
import { TributeViewer } from '@/components/tribute/tribute-viewer';
import { TributeConfig } from '@/types/tribute';
import { tributeVisibility } from '@/lib/tribute-access';
import { TributeExpired } from '@/components/tribute/tribute-expired';

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

    if (!tribute || tributeVisibility(tribute) !== 'live') {
      return { title: 'EternalPage', robots: { index: false, follow: false } };
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
      // Each tribute is private to whoever has the link: keep it out of search engines.
      robots: { index: false, follow: false },
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

  // Drafts that were not paid for never open at the public address (they have the
  // watermarked preview instead); Básico pages stop showing once their year is over.
  const visibility = tributeVisibility(tribute);
  if (visibility === 'unpublished') {
    notFound();
  }
  if (visibility === 'expired') {
    return <TributeExpired recipient={tribute.recipient} />;
  }

  // Increment view count (non-blocking)
  db.tribute.update({
    where: { id: tribute.id },
    data: { viewCount: { increment: 1 } },
  }).catch((e) => console.error('Failed to increment view count:', e));

  // The tap-to-open envelope is part of the Completo package,
  // and can be turned off by the giver.
  const config = buildConfig(tribute);
  const showIntro = getPackage((tribute.packageType as PackageType) || 'basic').limits.envelope && config.envelope !== false;

  return <TributeViewer config={config} slug={tribute.slug} showIntro={showIntro} />;
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
    music: tribute.musicUrl
      ? { url: tribute.musicUrl, autoplay: false, title: (stored as { musicTitle?: string }).musicTitle }
      : undefined,
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
    style: stored.style,
    counter: stored.counter,
    reasons: stored.reasons,
    voiceMessage: stored.voiceMessage,
    guestbook: stored.guestbook,
    authorName: stored.authorName,
    envelope: stored.envelope,
  };
}
