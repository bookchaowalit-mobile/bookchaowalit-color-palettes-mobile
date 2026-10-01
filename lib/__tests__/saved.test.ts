import { describe, expect, it } from "vitest";
import { encodeEnvelope, listCodec } from "../persist";
import { isSavedPalette, MAX_SAVED, removePalette, savePalette } from "../saved";

describe("saved palettes", () => {
  it("saves at the top and de-duplicates identical palettes", () => {
    let list = savePalette([], "#4a90d9", "analogous", 1);
    list = savePalette(list, "#FF0000", "triadic", 2);
    list = savePalette(list, "#4A90D9", "analogous", 3);
    expect(list.map((p) => [p.base, p.scheme])).toEqual([
      ["#4A90D9", "analogous"],
      ["#FF0000", "triadic"],
    ]);
    expect(list[0].colors.length).toBeGreaterThan(1);
  });

  it("ignores invalid colors and caps the list", () => {
    expect(savePalette([], "nope", "analogous", 1)).toEqual([]);
    let list = savePalette([], "#000000", "analogous", 0);
    for (let i = 1; i <= MAX_SAVED + 5; i++) list = savePalette(list, `#${i.toString(16).padStart(6, "0")}`, "analogous", i);
    expect(list).toHaveLength(MAX_SAVED);
  });

  it("removes by id and round-trips through storage", () => {
    const list = savePalette(savePalette([], "#123456", "complementary", 1), "#abcdef", "analogous", 2);
    const codec = listCodec(isSavedPalette);
    expect(codec.decode(codec.encode(list))).toEqual(list);
    expect(removePalette(list, list[0].id)).toHaveLength(1);
    const raw = encodeEnvelope([list[0], { ...list[0], id: "x", scheme: "rainbow" }, { ...list[0], id: "y", colors: ["red"] }]);
    expect(codec.decode(raw)).toEqual([list[0]]);
  });
});
