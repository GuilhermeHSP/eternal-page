import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// The picture that shows up when the site's link is shared on WhatsApp, Instagram and the like.
export const alt = 'EternalPage: uma página eterna para quem você ama';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const dataUrl = async (file: string, type: string) =>
  `data:${type};base64,${(await readFile(join(process.cwd(), 'public', file))).toString('base64')}`;

export default async function OpengraphImage() {
  // Ana's couple, the same photos as the example page on the home.
  const photo = await dataUrl('demo/casal-praia.jpg', 'image/jpeg');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', color: 'white' }}>
        <img src={photo} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 72px',
            backgroundImage: 'linear-gradient(to right, rgba(76,5,25,0.9) 0%, rgba(76,5,25,0.6) 45%, rgba(0,0,0,0) 75%)',
          }}
        >
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 600 }}>EternalPage</div>
          <div style={{ marginTop: 20, fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: 560 }}>
            Uma página eterna para quem você ama
          </div>
          <div style={{ marginTop: 18, fontSize: 30, opacity: 0.9, maxWidth: 520 }}>
            Fotos, carta, linha do tempo e música, para enviar de presente.
          </div>
        </div>
      </div>
    ),
    size
  );
}
