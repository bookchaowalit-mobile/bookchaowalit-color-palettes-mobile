# Upgrade Plan

## Current state

Score: 5/10 (was 2/10) — real palette generator with tested color math and honest CI;
still a single-screen app with no persistence and placeholder Explore tab.

## Backlog

- P1: Save favourite palettes locally (AsyncStorage) and list them on the Explore tab.
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
