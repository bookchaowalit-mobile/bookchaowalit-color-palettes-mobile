import { describe, expect, it } from "vitest";
import {
  PALETTE_SCHEMES,
  contrastRatio,
  generatePalette,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  randomHex,
  readableTextColor,
  rgbToHex,
  rgbToHsl,
} from "../color";

describe("normalizeHex", () => {
  it("expands shorthand and uppercases", () => {
    expect(normalizeHex("abc")).toBe("#AABBCC");
    expect(normalizeHex(" #4a90d9 ")).toBe("#4A90D9");
  });

  it("rejects invalid input", () => {
    expect(normalizeHex("")).toBeNull();
    expect(normalizeHex("#12345")).toBeNull();
    expect(normalizeHex("zzzzzz")).toBeNull();
  });
});

describe("conversions", () => {
  it("round-trips hex -> rgb -> hex", () => {
    expect(hexToRgb("#4A90D9")).toEqual({ r: 74, g: 144, b: 217 });
    expect(rgbToHex({ r: 74, g: 144, b: 217 })).toBe("#4A90D9");
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: -5, g: 300, b: 127.6 })).toBe("#00FF80");
  });

  it("round-trips rgb -> hsl -> rgb", () => {
    for (const hex of ["#FF0000", "#00FF00", "#0000FF", "#808080", "#4A90D9"]) {
      expect(rgbToHex(hslToRgb(rgbToHsl(hexToRgb(hex))))).toBe(hex);
    }
  });

  it("throws on invalid hex", () => {
    expect(() => hexToRgb("nope")).toThrow();
  });
});

describe("contrast", () => {
  it("matches WCAG extremes", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("picks readable text", () => {
    expect(readableTextColor("#FFFF00")).toBe("#000000");
    expect(readableTextColor("#000080")).toBe("#FFFFFF");
  });
});

describe("generatePalette", () => {
  it("returns the complement of red", () => {
    expect(generatePalette("#F00", "complementary")).toEqual(["#FF0000", "#00FFFF"]);
  });

  it("returns triadic primaries", () => {
    expect(generatePalette("#FF0000", "triadic")).toEqual(["#FF0000", "#00FF00", "#0000FF"]);
  });

  it("produces the expected size for every scheme, base first", () => {
    const sizes = { complementary: 2, analogous: 3, triadic: 3, tetradic: 4, monochromatic: 5 };
    for (const scheme of PALETTE_SCHEMES) {
      const palette = generatePalette("#4A90D9", scheme);
      expect(palette).toHaveLength(sizes[scheme]);
      expect(palette[0]).toBe("#4A90D9");
      palette.forEach((hex) => expect(normalizeHex(hex)).toBe(hex));
    }
  });

  it("rejects invalid base colors", () => {
    expect(() => generatePalette("xyz", "analogous")).toThrow();
  });
});

describe("randomHex", () => {
  it("is deterministic with an injected rng", () => {
    expect(randomHex(() => 0)).toBe("#000000");
    expect(randomHex(() => 0.9999)).toBe("#FFFFFF");
  });
});

describe("pass 3 edge cases", () => {
  it("monochromatic palettes have five distinct colors even for white, black and near-extremes", () => {
    for (const hex of ["#FFFFFF", "#000000", "#F0F0F0", "#0A0A0A", "#CCE0FF", "#808080"]) {
      const palette = generatePalette(hex, "monochromatic");
      expect(new Set(palette).size).toBe(5);
    }
  });
  it("accepts full-width and zero-width-polluted hex input", () => {
    expect(normalizeHex("＃ＦＦ００００")).toBe("#FF0000");
    expect(normalizeHex("#abc​")).toBe("#AABBCC");
    expect(normalizeHex("﻿#abc")).toBe("#AABBCC");
    expect(normalizeHex("0xabc")).toBeNull();
  });
});
