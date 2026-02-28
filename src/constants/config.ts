/**
 * API keys: set in .env (EXPO_PUBLIC_*) or in app.config.js extra.
 * Expo inlines EXPO_PUBLIC_* from env; extra is available via Constants.expoConfig.extra.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig as { extra?: Record<string, string> } | undefined)?.extra ?? {};

export const config = {
  get anthropicApiKey(): string {
    return extra.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ANTHROPIC_API_KEY) ?? '';
  },
  get elevenLabsAgentId(): string {
    return extra.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ELEVENLABS_AGENT_ID) ?? '';
  },
  get googleMapsApiKey(): string {
    return extra.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) ?? '';
  },
};
