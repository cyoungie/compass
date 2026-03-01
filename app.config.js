const path = require('path');
const { config } = require('dotenv');

// Load .env from project root so it's found regardless of how Expo is started
config({ path: path.resolve(__dirname, '.env') });

const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  extra: {
    EXPO_PUBLIC_ANTHROPIC_API_KEY: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? process.env.EXPO_ANTHROPIC_API_KEY ?? '',
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
};
