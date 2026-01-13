# Marketing Intelligence Dashboard (Expo + React Native)

Cross-platform (iOS, Android, Web) **marketing intelligence & profit forecast** app built with **Expo + React Native**.

It starts with a conversational coach to capture the basics, then expands into a **business intelligence dashboard**: market sizing (TAM/SAM), budget allocation, growth projections, and deterministic revenue/profit/ROI forecasting.

## What you get

- **Marketing Coach chat**: one question at a time, with short reactive feedback + typing indicator
- **Gamification**: live **Marketing Score (0–100)**, confidence meter, progress bar, and badges
- **Animated chart**: success projection line animates in + annotated moments in the timeline
- **What‑if mode**: tweak budget/add a channel and see score, chart, and tips update in real time
- **Marketing Intelligence Dashboard**:
  - Market size & growth: **TAM**, **SAM**, **YoY growth** with bar + radial visuals and tooltips
  - Budget input & allocation: monthly budget + channel mix (paid/social/email/content) with a pie chart + sliders
  - Profit & ROI forecast: annual spend, revenue, profit, ROI, market share, confidence, and animated projections
  - Insight cards: explainable recommendations with impact estimates
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
    charts/          # SVG charts for dashboard + projections
  constants/         # theme tokens
  services/          # optional API layer (web-safe)
  types/             # shared TypeScript types
  utils/             # deterministic projections + marketing intelligence calculations
```

