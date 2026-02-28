const { config } = require('dotenv');

// Load .env into process.env so EXPO_PUBLIC_* are available
config();

const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  extra: {
    EXPO_PUBLIC_ANTHROPIC_API_KEY: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
    EXPO_PUBLIC_ELEVENLABS_AGENT_ID: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '',
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
};
