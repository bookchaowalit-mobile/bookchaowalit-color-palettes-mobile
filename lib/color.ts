/**
 * Pure color utilities used by the palette generator.
 * No React Native imports so the logic can be unit-tested in Node.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export type PaletteScheme =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic";

export const PALETTE_SCHEMES: readonly PaletteScheme[] = [
  "complementary",
  "analogous",
  "triadic",
  "tetradic",
  "monochromatic",
];

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalizes `abc`, `#abc`, `#AABBCC` to `#AABBCC`; returns null when invalid. */
export function normalizeHex(input: string): string | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  let digits = match[1];
  if (digits.length === 3) {
    digits = digits
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${digits.toUpperCase()}`;
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`Invalid hex color: ${hex}`);
  const value = parseInt(normalized.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

const clampByte = (n: number) => Math.min(255, Math.max(0, Math.round(n)));

export function rgbToHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => clampByte(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  if (sn === 0) {
    const v = ln * 255;
    return { r: clampByte(v), g: clampByte(v), b: clampByte(v) };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue = (t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  return {
    r: clampByte(hue(hn + 1 / 3) * 255),
    g: clampByte(hue(hn) * 255),
    b: clampByte(hue(hn - 1 / 3) * 255),
  };
}

/** WCAG 2.x relative luminance (0..1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Picks black or white text, whichever has the higher contrast on `background`. */
export function readableTextColor(background: string): "#000000" | "#FFFFFF" {
  return contrastRatio(background, "#000000") >= contrastRatio(background, "#FFFFFF")
    ? "#000000"
    : "#FFFFFF";
}

function rotate(hsl: Hsl, degrees: number): string {
  return rgbToHex(hslToRgb({ ...hsl, h: hsl.h + degrees }));
}

/** Builds a palette (base color first) for a color-harmony scheme. */
export function generatePalette(baseHex: string, scheme: PaletteScheme): string[] {
  const base = normalizeHex(baseHex);
  if (!base) throw new Error(`Invalid hex color: ${baseHex}`);
  const hsl = rgbToHsl(hexToRgb(base));
  switch (scheme) {
    case "complementary":
      return [base, rotate(hsl, 180)];
    case "analogous":
      return [base, rotate(hsl, -30), rotate(hsl, 30)];
    case "triadic":
      return [base, rotate(hsl, 120), rotate(hsl, 240)];
    case "tetradic":
      return [base, rotate(hsl, 90), rotate(hsl, 180), rotate(hsl, 270)];
    case "monochromatic":
      return [base, ...[-30, -15, 15, 30].map((delta) =>
        rgbToHex(hslToRgb({ ...hsl, l: Math.min(95, Math.max(5, hsl.l + delta)) })),
      )];
  }
}

/** Random color; pass a deterministic `rng` in tests. */
export function randomHex(rng: () => number = Math.random): string {
  return rgbToHex({
    r: Math.floor(rng() * 256),
    g: Math.floor(rng() * 256),
    b: Math.floor(rng() * 256),
  });
}
