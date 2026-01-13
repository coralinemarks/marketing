# Marketing Coach (Marketing Plan Insight App)

Cross-platform (iOS, Android, Web) app built with **Expo + React Native** that feels like a **conversational marketing coach**.

Instead of a static form, you get a guided chat experience with live scoring, animated data, and a “what‑if” sandbox to explore improvements.

## What you get

- **Marketing Coach chat**: one question at a time, with short reactive feedback + typing indicator
- **Gamification**: live **Marketing Score (0–100)**, confidence meter, progress bar, and badges
- **Animated chart**: success projection line animates in + annotated moments in the timeline
- **What‑if mode**: tweak budget/add a channel and see score, chart, and tips update in real time
- **Save + share**: save plans locally, load/delete them, and copy a shareable text summary
- **Expo Web + Vercel ready**: static export + `vercel.json`

## Tech

- Expo (SDK 54, latest stable at time of scaffold)
- React Native + TypeScript
- Functional components + hooks
- Animations: `moti` + `react-native-reanimated` (Expo Web compatible)
- Gradients: `expo-linear-gradient`
- Storage: `@react-native-async-storage/async-storage` (works on web via RNW)
- Chart: `react-native-svg` (works on Expo Web)

## Run locally

Install dependencies:

```bash
npm install
```

Start the Expo dev server:

```bash
npm run start
```

Run on specific platforms:

```bash
npm run android
npm run ios
npm run web
```

Typecheck:

```bash
npm run typecheck
```

## Build for web (static export)

This generates a deployable static site into `dist/`:

```bash
npm run build:web
```

You can serve `dist/` locally with any static server.

## Deploy to Vercel

### Option A: Vercel UI (recommended)

- Import this GitHub repo in Vercel
- Framework preset: **Other**
- Build Command: `npm run build:web`
- Output Directory: `dist`
- Deploy

This repo also includes `vercel.json` with those settings.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

## Environment variables (optional)

If you later add an external API call, use Expo’s web-compatible public env vars:

- `EXPO_PUBLIC_MARKETING_API_BASE_URL`
- `EXPO_PUBLIC_MARKETING_API_KEY` (if needed)

See `src/services/api.ts` for the suggested pattern.

## Project structure

```text
src/
  components/        # UI building blocks (chat, cards, chart, tips)
  constants/         # theme tokens
  services/          # optional API layer (web-safe)
  types/             # shared TypeScript types
  utils/             # deterministic projection + helpers
```

