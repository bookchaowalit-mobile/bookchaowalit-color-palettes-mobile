/** Saved palettes: pure helpers (no React Native imports) so they are unit-testable. */
import { generatePalette, normalizeHex, PALETTE_SCHEMES, type PaletteScheme } from "./color";

export interface SavedPalette {
  id: string;
  base: string;
  scheme: PaletteScheme;
  colors: string[];
  savedAt: number;
}

export const MAX_SAVED = 50;

/** Saves base+scheme at the top; an identical palette moves up instead of duplicating. */
export function savePalette(list: SavedPalette[], baseHex: string, scheme: PaletteScheme, now: number): SavedPalette[] {
  const base = normalizeHex(baseHex);
  if (!base) return list;
  const rest = list.filter((p) => !(p.base === base && p.scheme === scheme));
  const entry: SavedPalette = { id: `${now.toString(36)}-${base.slice(1)}-${scheme}`, base, scheme, colors: generatePalette(base, scheme), savedAt: now };
  return [entry, ...rest].slice(0, MAX_SAVED);
}

export function removePalette(list: SavedPalette[], id: string): SavedPalette[] {
  return list.filter((p) => p.id !== id);
}

/** Type guard used when loading saved palettes from local storage. */
export function isSavedPalette(value: unknown): value is SavedPalette {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.base === "string" &&
    normalizeHex(p.base) === p.base &&
    PALETTE_SCHEMES.includes(p.scheme as PaletteScheme) &&
    Array.isArray(p.colors) &&
    p.colors.every((c) => typeof c === "string" && normalizeHex(c) !== null) &&
    typeof p.savedAt === "number" &&
    Number.isFinite(p.savedAt)
  );
}
