#  setup (auth + Firestore)

Follow these steps so sign-in and “Create account” work in the app.

## 1. Create a  project

1. Go to [ Console](https://console..google.com/) and create a project (or use an existing one).
2. In **Project settings** (gear) → **Your apps**, add a **Web** app if you haven’t. Copy the config (apiKey, authDomain, projectId, etc.).

## 2. Enable Email/Password sign-in

1. In the left sidebar open **Build** → **Authentication**.
2. Go to the **Sign-in method** tab.
3. Click **Email/Password**, turn **Enable** on, and save.

If this is not enabled, sign-in and create-account will fail with an error like “Email/password sign-in is not enabled” (the app now shows this message when it happens).

### (Optional) Enable Anonymous sign-in

If you use `authService.signInAnonymously()` (anonymous auth), enable it too:

1. In **Authentication** → **Sign-in method**, click **Anonymous**.
2. Turn **Enable** on and save.

Otherwise anonymous sign-in will fail with `auth/operation-not-allowed`.

## 3. Create Firestore and set rules

1. In the left sidebar open **Build** → **Firestore Database**.
2. Click **Create database**, choose **Start in test mode** (we’ll replace with real rules next), pick a region, and create.
3. Go to the **Rules** tab and replace the default rules with the contents of this repo’s **`firestore.rules`** file (or paste the rules below), then **Publish**:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

4. (Optional) When the app first loads the community feed, Firestore may prompt you to create a **composite index** on `posts` for `createdAt` descending. Use the link in the error to create it in the Console.

## 4. Put config in `.env`

Create or edit `.env` in the project root. **Use one line per variable** (no comma-separated list on a single line). Include at least:

```bash
EXPO_PUBLIC__API_KEY=your-api-key
EXPO_PUBLIC__PROJECT_ID=your-project-id
```

Optional but recommended (from your web app config in Project settings):

```bash
EXPO_PUBLIC__AUTH_DOMAIN=your-project.app.com
EXPO_PUBLIC__STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC__MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC__APP_ID=1:123456789:web:abc123
```

The app only requires `EXPO_PUBLIC__API_KEY` and `EXPO_PUBLIC__PROJECT_ID` to consider  “configured”; the rest improve reliability.

## 5. Restart the app with a clean cache

So that `app.config.js` reloads `.env` and the app sees the new vars:

```bash
npx expo start --clear
```

Then open the app again. You should see the Sign In / onboarding flow and be able to create an account and sign in.

## Checklist

- [ ]  project created; web app added
- [ ] Authentication → Sign-in method → **Email/Password** enabled
- [ ] (Optional) **Anonymous** enabled if using `authService.signInAnonymously()`
- [ ] Firestore database created
- [ ] Firestore rules updated from `firestore.rules` and published
- [ ] `.env` has at least `EXPO_PUBLIC__API_KEY` and `EXPO_PUBLIC__PROJECT_ID` (one per line)
- [ ] App restarted with `npx expo start --clear`

If something still fails, the app will show a short message (e.g. “Email/password sign-in is not enabled…” or “Please enter a valid email address”). Check the message and the steps above.
