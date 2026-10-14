// Turns a photo chosen in the browser into a resized JPEG data URL, so it can be saved with
// the tribute (a blob: URL only works in the tab that created it) without storing a 10 MB file.
export async function fileToResizedDataUrl(file: File, maxSide = 1600, quality = 0.85): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('not-an-image');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('unreadable-image'));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no-canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
