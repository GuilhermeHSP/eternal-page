import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
      return { title: 'Tribute Not Found | EternalPage' };
    }

    const config = JSON.parse(tribute.config) as TributeConfig;
    const heroImage = config.hero?.image || tribute.heroImage;

    return {
      title: `${tribute.title} | EternalPage`,
      description: `A heartfelt tribute for ${tribute.recipient}`,
      openGraph: {
        title: tribute.title,
        description: `A heartfelt tribute for ${tribute.recipient}`,
        images: heroImage ? [{ url: heroImage }] : [],
        type: 'website',
      },
    };
  } catch (e) {
    console.error('Error in generateMetadata:', e);
    return { title: 'Tribute | EternalPage' };
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

  const config = JSON.parse(tribute.config) as TributeConfig;

  return <TributeViewer config={config} slug={tribute.slug} />;
}
