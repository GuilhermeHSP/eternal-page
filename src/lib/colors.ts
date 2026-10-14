// Colours a person can pick for their tribute, independent of the template.
export const TRIBUTE_COLORS = [
  { name: 'Rosa', hex: '#e11d48' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Vermelho', hex: '#be123c' },
  { name: 'Coral', hex: '#f97316' },
  { name: 'Dourado', hex: '#b7791f' },
  { name: 'Verde', hex: '#059669' },
  { name: 'Azul-petróleo', hex: '#0f766e' },
  { name: 'Azul', hex: '#0369a1' },
  { name: 'Marinho', hex: '#1e3a8a' },
  { name: 'Lilás', hex: '#9333ea' },
  { name: 'Grafite', hex: '#374151' },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixWithWhite(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const mixed = rgb.map((c) => Math.round(c + (255 - c) * amount));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function isValidHex(hex: string | undefined | null): hex is string {
  return !!hex && hexToRgb(hex) !== null;
}

// The style overrides for a chosen colour: the accent itself, a very light page background
// and a soft tone for the floating hearts or petals.
export function styleForColor(hex: string) {
  return {
    accentColor: hex,
    backgroundColor: mixWithWhite(hex, 0.95),
    backgroundAnimation: { color: mixWithWhite(hex, 0.6) },
  };
}
