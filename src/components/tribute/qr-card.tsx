'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrCardProps {
  url: string;
  recipient?: string;
  accentColor?: string;
}

// A printable card with the tribute's QR code, to go with a physical gift: scan it with the
// phone camera and the page opens. Generated in the browser; the link goes nowhere else.
export function QrCard({ url, recipient, accentColor = '#e11d48' }: QrCardProps) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 600, margin: 1, color: { dark: '#1f2937', light: '#ffffff' }, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => setQr(null));
  }, [url]);

  // Draws the whole card (title, name, QR, hint) on a canvas so it can be saved as one image.
  const renderCard = async (): Promise<string | null> => {
    if (!qr) return null;
    await Promise.all([
      document.fonts.load('80px "Great Vibes"'),
      document.fonts.load('28px "Josefin Sans"'),
    ]).catch(() => {});
    const W = 1200;
    const H = 1600;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    ctx.font = '600 34px "Josefin Sans", sans-serif';
    ctx.fillText('UMA SURPRESA PARA', W / 2, 220);

    ctx.fillStyle = accentColor;
    ctx.font = '150px "Great Vibes", cursive';
    ctx.fillText(recipient || 'Você', W / 2, 400, W - 200);

    const img = new Image();
    img.src = qr;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    const size = 700;
    ctx.drawImage(img, (W - size) / 2, 500, size, size);

    ctx.fillStyle = '#374151';
    ctx.font = '400 40px "Josefin Sans", sans-serif';
    ctx.fillText('Aponte a câmera do celular', W / 2, 1310);
    ctx.fillText('para abrir a sua homenagem', W / 2, 1365);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '400 28px "Josefin Sans", sans-serif';
    ctx.fillText('feito com EternalPage', W / 2, 1480);

    return canvas.toDataURL('image/png');
  };

  const download = async () => {
    const card = await renderCard();
    if (!card) return;
    const a = document.createElement('a');
    a.href = card;
    a.download = `cartao-homenagem${recipient ? `-${recipient.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}` : ''}.png`;
    a.click();
  };

  const print = async () => {
    const card = await renderCard();
    if (!card) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(
      `<!doctype html><html><head><title>Cartão da homenagem</title><style>@page{margin:0}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}img{width:10cm;height:auto}</style></head><body><img src="${card}" onload="setTimeout(()=>{window.print()},200)"></body></html>`
    );
    win.document.close();
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 text-center">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
        <QrCode className="h-4 w-4" style={{ color: accentColor }} />
        Cartão com QR code
      </div>
      <p className="mt-1 text-xs text-gray-500">Imprima e coloque junto do presente: é só apontar a câmera do celular.</p>
      <div className="mt-4 mx-auto w-40 h-40 rounded-lg bg-white p-2 ring-1 ring-gray-100 flex items-center justify-center">
        {qr ? <img src={qr} alt="QR code da homenagem" className="w-full h-full" /> : <div className="w-full h-full bg-gray-50 animate-pulse rounded" />}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Button type="button" variant="outline" className="gap-2" onClick={download} disabled={!qr}>
          <Download className="h-4 w-4" />
          Baixar cartão
        </Button>
        <Button type="button" variant="outline" className="gap-2" onClick={print} disabled={!qr}>
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}
