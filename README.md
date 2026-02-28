# Compass

A React Native (Expo) mobile app for foster youth aging out of care. Two phases: **onboarding** (form → optional voice/summary) and **dashboard** (home, legal rights, mental check-in, resources, community) with a floating support chat.

## Tech stack

- **React Native** (Expo SDK 55)
- **ElevenLabs** Conversational AI (voice onboarding, dev build only)
- **Anthropic Claude API** — profile from transcript, welcome summary, in-app chat
- **Google Maps Places API** — nearby food banks, shelters, FQHCs by zip
- **AsyncStorage** — user profile and mental check-ins (client-side only)

## Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_ANTHROPIC_API_KEY` — Claude API key
   - `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` — (optional) for voice onboarding in dev builds
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — for Resources tab
   - **Firebase (optional):** For auth + cloud profile + real community, add from Firebase Console → Project settings → Your web app: `EXPO_PUBLIC_FIREBASE_*` vars (see `.env.example`). Enable Auth (Email/Password) and Firestore. Create an index on `posts` for `createdAt` desc when prompted.

3. **Run**
   ```bash
   npx expo start --ios
   ```
   In Expo Go, onboarding skips voice and goes straight to the main app. For real voice, use a dev build: `npx expo run:ios`.

## App flow

- **Onboarding:** Name, optional birthday, zip → profile saved → main app. With Firebase, you can create an account (email/password) at the end to sync profile to the cloud.
- **Dashboard:** Home, Mental, Resources, Community (real feed when Firebase configured), floating chat. Sign in/sign out when using Firebase.

## License

Private / your choice.
