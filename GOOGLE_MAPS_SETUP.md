# Google Maps API setup (Resources tab)

The Resources tab uses the **Geocoding API** (zip → lat/lng) and **Places API** (Text Search + Details) to show nearby food banks, shelters, FQHCs, legal aid, and clothing banks by the user’s zip code.

## 1. Create or select a Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one (e.g. you can use the same project as Firebase if you like).

## 2. Enable the APIs

1. In the left menu go to **APIs & Services** → **Library**.
2. Search for and **enable**:
   - **Geocoding API** — converts zip code to coordinates.
   - **Places API** — Text Search (nearby places) and Details (phone numbers).

## 3. Create an API key

1. Go to **APIs & Services** → **Credentials**.
2. Click **+ Create credentials** → **API key**.
3. Copy the key. (You can restrict it in the next step.)

### (Recommended) Restrict the key

1. Click the key you just created (or **Edit API key**).
2. Under **Application restrictions**:
   - **Expo / React Native:** For development you can leave **None** or use **HTTP referrers** and add your Expo URLs (e.g. `https://localhost:*`, your tunnel URL). For production, restrict by **Android app** or **iOS app** (add your bundle ID, e.g. `com.compass.app`).
3. Under **API restrictions**, choose **Restrict key** and select only:
   - **Geocoding API**
   - **Places API**
4. Save.

## 4. Add the key to `.env`

In your project root, create or edit `.env` and add **one line**:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

Use your real key instead of `your-api-key-here`. Keep each variable on its own line.

## 5. Restart the app

So the app picks up the new env value:

```bash
npx expo start --clear
```

Then open the Resources tab and enter or use your zip code. You should see nearby places (food banks, shelters, FQHCs, etc.).

## APIs used by the app

| API              | Use in app                          |
|------------------|-------------------------------------|
| Geocoding API    | Zip code → lat/lng, city, county, state |
| Places API (Text Search) | Nearby food banks, shelters, FQHCs, legal aid, clothing |
| Places API (Details)     | Optional: phone numbers for a place |

## Checklist

- [ ] Google Cloud project created or selected
- [ ] **Geocoding API** enabled
- [ ] **Places API** enabled
- [ ] API key created (and optionally restricted)
- [ ] `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` added to `.env` (one line)
- [ ] App restarted with `npx expo start --clear`

If the Resources tab still shows no results, check that the key is in `.env` with no typos and that both APIs are enabled for the project linked to that key.
