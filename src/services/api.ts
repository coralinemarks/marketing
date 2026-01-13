/**
 * Optional API layer.
 *
 * This app ships with fully local (simulated) insights by default.
 * If you later want to call an external API (LLM, analytics, etc.),
 * keep requests here so the UI remains platform-agnostic.
 *
 * Expo + Vercel tip:
 * - Use `EXPO_PUBLIC_*` env vars for values that must be available in web builds.
 * - Example: `EXPO_PUBLIC_MARKETING_API_BASE_URL=https://...`
 */

export type ApiConfig = {
  baseUrl: string;
  apiKey?: string;
};

export function getApiConfig(): ApiConfig | null {
  const baseUrl = process.env.EXPO_PUBLIC_MARKETING_API_BASE_URL;
  if (!baseUrl) return null;
  return {
    baseUrl,
    apiKey: process.env.EXPO_PUBLIC_MARKETING_API_KEY,
  };
}

// Example (unused) helper:
// export async function fetchSomething() { ... }

