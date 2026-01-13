# Marketing Plan Analysis (Expo + React Native)

Cross-platform (iOS, Android, Web) app built with **Expo + React Native** to help users analyze and improve a company’s marketing plan through a **chat-style flow**.

## What you get

- **Company input chat**: capture company name + product/service
- **Marketing plan question chat**: target audience, channels, budget, goals
- **Marketing success over time**: simulated projection chart (web-safe via SVG)
- **Actionable tips**: tailored improvements based on answers
- **Expo Web + Vercel ready**: static export + `vercel.json`

## Tech

- Expo (SDK 54, latest stable at time of scaffold)
- React Native + TypeScript
- Functional components + hooks
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

