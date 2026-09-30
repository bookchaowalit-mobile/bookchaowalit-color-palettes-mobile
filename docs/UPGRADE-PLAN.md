# Upgrade Plan

## Current state

Score: 5/10 (was 2/10) — real palette generator with tested color math and honest CI;
still a single-screen app with no persistence and placeholder Explore tab.

## Backlog

- P1: Replace the placeholder Explore tab (e.g. curated palettes) or remove it.
- P1: Share/copy a palette (expo-clipboard / Share API) as hex list or CSS variables.
- P1: Component tests for the palette screen (jest-expo + @testing-library/react-native).
- P2: Contrast checker between two swatches with AA/AAA badges (logic already in `lib/color.ts`).
- P2: Dark-mode styles (app.json already sets `userInterfaceStyle: automatic`).
- P2: Link the EAS project (`eas init`) so the preview build job can run.

## Done in this pass

- Fixed the app not bundling: aligned `expo-router`/`react-native`/`expo-constants`
  with SDK 53 and added missing `expo-font`, `expo-asset`, `query-string` deps.
- Palette generator screen backed by pure `lib/color.ts` (hex/RGB/HSL, WCAG contrast,
  five harmony schemes) with 13 vitest tests.
- CI now runs `npm ci`, typecheck, lint, tests and an Android JS bundle without `|| true`;
  EAS job skips cleanly when `EXPO_TOKEN` is absent; added `eas.json`.
- Committed ESLint flat config and `package-lock.json`; header colour darkened for
  white-text contrast (AA).

## Done in this pass (pass 2)

Score: 6/10 (was 5/10) — palettes can be saved, reopened and deleted, and persist across restarts.

- Saved palettes: "Save palette" stores base+scheme+colors (de-duplicated, capped at 50) with AsyncStorage (`@react-native-async-storage/async-storage` 2.1.2) via `lib/usePersistentState.ts`; tapping a saved row restores it. Logic in `lib/saved.ts` with a validating guard (tested). Shown on the Palettes tab rather than Explore so both stay in sync without a shared store.
- Accessibility: random/save/delete buttons labelled with the palette they act on; profile links get link roles.
- Advisories: `overrides.postcss ^8.5.28` clears the high-severity PostCSS advisory in Expo metro-config (minor bump). Remaining `image-size` (metro, bundler-only), `uuid` (via `xcode`) and `decode-uri-component` (via `query-string@7`) need an Expo SDK major upgrade; deliberately not auto-fixed.
- Verified: typecheck, lint, 22 vitest tests, Android `expo export` bundle.
