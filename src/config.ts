// Environment configuration for Amazon Tariff extension

export const ENV = {
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  UPSTASH_REDIS_URL: import.meta.env.VITE_UPSTASH_REDIS_URL,
  UPSTASH_REDIS_TOKEN: import.meta.env.VITE_UPSTASH_REDIS_TOKEN,
  AI_MODEL: "google/gemini-2.0-flash-lite-001",
};
