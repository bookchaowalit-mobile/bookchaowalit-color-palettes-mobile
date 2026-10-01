import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  PALETTE_SCHEMES,
  type PaletteScheme,
  generatePalette,
  normalizeHex,
  randomHex,
  readableTextColor,
} from "../../lib/color";
import { listCodec } from "../../lib/persist";
import { isSavedPalette, removePalette, savePalette, type SavedPalette } from "../../lib/saved";
import { usePersistentState } from "../../lib/usePersistentState";

const savedCodec = listCodec(isSavedPalette);

export default function PaletteScreen() {
  const [input, setInput] = useState("#4A90D9");
  const [scheme, setScheme] = useState<PaletteScheme>("analogous");
  const [saved, setSaved] = usePersistentState<SavedPalette[]>("palettes.saved.v1", [], savedCodec);

  const base = normalizeHex(input);
  const palette = useMemo(() => (base ? generatePalette(base, scheme) : []), [base, scheme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label} nativeID="baseColorLabel">
        Base color (hex)
      </Text>
      <View style={styles.row}>
        <TextInput
          accessibilityLabelledBy="baseColorLabel"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          onChangeText={setInput}
          style={[styles.input, !base && styles.inputError]}
          value={input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Random base color"
          onPress={() => setInput(randomHex())}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Random</Text>
        </Pressable>
      </View>
      {!base && <Text style={styles.error}>Enter a color like #4A90D9 or #abc.</Text>}

      <View style={styles.chips} accessibilityRole="radiogroup">
        {PALETTE_SCHEMES.map((s) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: s === scheme }}
            key={s}
            onPress={() => setScheme(s)}
            style={[styles.chip, s === scheme && styles.chipActive]}
          >
            <Text style={[styles.chipText, s === scheme && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={base ? `Save ${scheme} palette from ${base}` : "Save palette, enter a valid color first"}
        accessibilityState={{ disabled: !base }}
        disabled={!base}
        onPress={() => base && setSaved((list) => savePalette(list, base, scheme, Date.now()))}
        style={[styles.button, styles.saveButton, !base && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Save palette</Text>
      </Pressable>

      {palette.map((hex, i) => (
        <Pressable
          accessibilityHint="Uses this color as the new base"
          accessibilityLabel={`Swatch ${hex}`}
          accessibilityRole="button"
          key={`${i}-${hex}-${scheme}`}
          onPress={() => setInput(hex)}
          style={[styles.swatch, { backgroundColor: hex }]}
        >
          <Text style={[styles.swatchText, { color: readableTextColor(hex) }]}>
            {hex}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.label} accessibilityRole="header">
        Saved palettes ({saved.length})
      </Text>
      {saved.length === 0 && <Text style={styles.muted}>Nothing saved yet — tap “Save palette”.</Text>}
      {saved.map((p) => (
        <View key={p.id} style={styles.savedRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open saved ${p.scheme} palette ${p.colors.join(", ")}`}
            onPress={() => {
              setInput(p.base);
              setScheme(p.scheme);
            }}
            style={styles.savedSwatches}
          >
            {p.colors.map((c, i) => (
              <View key={`${c}-${i}`} style={[styles.savedSwatch, { backgroundColor: c }]} />
            ))}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete saved ${p.scheme} palette from ${p.base}`}
            hitSlop={8}
            onPress={() => setSaved((list) => removePalette(list, p.id))}
          >
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 16, gap: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#333" },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: { borderColor: "#C62828" },
  error: { color: "#C62828", fontSize: 13 },
  button: {
    backgroundColor: "#2F6DB5",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  saveButton: { paddingVertical: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#8A9BB0" },
  muted: { color: "#555" },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  savedSwatches: { flex: 1, flexDirection: "row", height: 36, borderRadius: 8, overflow: "hidden" },
  savedSwatch: { flex: 1 },
  delete: { color: "#B00020", fontWeight: "600" },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2F6DB5",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#2F6DB5" },
  chipText: { color: "#2F6DB5", textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  swatch: {
    height: 72,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  swatchText: { fontSize: 18, fontWeight: "700", letterSpacing: 1 },
});
