# iOS Simulator / dev build troubleshooting

## Dev build won't open (`npx expo run:ios`)

If the custom dev build **doesn’t open** or you see a **red error screen** as soon as it launches, use this checklist.

### 1. Red screen: "NativeModule: AsyncStorage is null"

The app is running but **AsyncStorage** isn’t linked in the build. Do a **full clean rebuild**:

```bash
cd ios
rm -rf build Pods
pod install
cd ..
npx expo run:ios
```

After this, the app should open. If you still see the error, run Metro with a clean cache in one terminal (`npx expo start --clear`) and in another run `npx expo run:ios`.

### 2. App never appears (black screen or immediate close)

- **Metro must be running.** When you run `npx expo run:ios`, it usually starts Metro for you. If you ran the app from Xcode only, start Metro first: `npx expo start`, then press `i` for iOS or run from Xcode.
- **Check the scheme.** In Xcode, make sure the scheme is **Compass** and the run destination is a simulator (e.g. iPhone 17 Pro).
- **Check Xcode console** for a native crash (e.g. missing framework or signing issue).

### 3. Confirm entry and config

- **Entry:** `package.json` should have `"main": "expo/AppEntry.js"` and your root component in `App.tsx`. Don’t change this unless you know you need a custom entry.
- **Bundle ID:** `app.json` has `ios.bundleIdentifier: "com.compass.app"`. It must match what’s in Xcode and in your provisioning profile if you run on a real device.

### 4. One-shot “fix everything” rebuild

From the project root:

```bash
cd ios && rm -rf build Pods Podfile.lock && pod install && cd ..
npx expo start --clear
```

In a **second terminal**:

```bash
npx expo run:ios
```

---

## Run `pod install`

This project uses a dev build (has an `ios/` folder), not the fully managed workflow. Install iOS native dependencies with CocoaPods when needed:

```bash
cd ios
pod install
cd ..
```

Or from the project root in one line:

```bash
cd ios && pod install && cd ..
```

**When to run it:** after the first clone, after `npx expo prebuild`, after adding or updating native modules, or when the app or docs tell you to run `pod install`. Then run the app with `npx expo run:ios`.

---

## AsyncStorage: "NativeModule: AsyncStorage is null"

If you see **`[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null`**, the AsyncStorage native module wasn’t linked in the build. Do a **clean rebuild**:

```bash
cd ios
rm -rf build Pods
pod install
cd ..
npx expo run:ios
```

Optional: if the error persists, clear Metro’s cache and run again:

```bash
npx expo start --clear
```

Then in another terminal run `npx expo run:ios` (or press `i` in the Metro window to launch iOS).

---

## EPERM errors (reading .Trash / Library)

If you see many **`Error "EPERM" reading contents of "/Users/.../Library/..."`** or **`.Trash`** messages when starting the app, something (often Watchman or Metro) is trying to read system directories it can’t access. The app can still run; these are warnings.

**What we did in the project:**
- **`metro.config.js`** — limits Metro to the project directory and blocklists those paths.
- **`.watchmanconfig`** — tells Watchman to ignore common build/output dirs.

**If EPERM still appears:**
- Reset Watchman (if installed): `watchman watch-del-all`
- Start Metro with a clean cache: `npx expo start --clear`, then run the app from another terminal with `npx expo run:ios`.

You can ignore the EPERM messages as long as the app opens and the red **AsyncStorage** error is fixed with a clean rebuild (see above).

---

## Why does the same error keep coming back?

The iOS app is built from **two places**: your `ios/` folder (Xcode project) and **Pods**, which pull source from **node_modules**. So:

- **Expo’s Swift code** is compiled from `node_modules/expo/ios/...`. We patch that file so it matches the React Native API.
- If you run **`npm install`** again (or clone the repo, or install on another machine), **patch-package** is supposed to re-apply the patch in `patches/expo+55.0.4.patch`. If that fails (wrong Expo version, patch format, etc.), the file goes back to the unpatched version and the build fails again with the same Swift error.
- **CocoaPods** does not copy Expo into `ios/Pods`; it builds from `node_modules/expo`. So the only copy that matters is the one in `node_modules/expo`. If that file is unpatched, the build will keep failing.

**What to do:**  
1. Re-apply the fix (see “ExpoReactNativeFactory fix” below).  
2. Clean the iOS build and Pods so Xcode recompiles from the patched source.  
3. Run `npx expo run:ios` again.

---

## ExpoReactNativeFactory fix (bundleConfiguration / devMenuConfiguration)

If you see:

- `missing argument for parameter 'bundleConfiguration' in call`
- `value of optional type 'RCTDevMenuConfiguration?' must be unwrapped`

then the Expo ↔ React Native compatibility patch is missing or was reverted.

### Option A: Re-run patch-package

```bash
cd /Users/cheyoungahn/Desktop/compass
npx patch-package
```

Then clean and build:

```bash
cd ios
rm -rf build Pods
pod install
cd ..
npx expo run:ios
```

### Option B: Apply the fix by hand (if the patch won’t apply)

Edit **`node_modules/expo/ios/AppDelegates/ExpoReactNativeFactory.swift`**.

In **both** places where you see **`devMenuConfiguration: self.devMenuConfiguration`** (one inside `factory.superView(...)`, one inside `rootViewFactory.view(...)`), change it to:

**`devMenuConfiguration: self.devMenuConfiguration ?? RCTDevMenuConfiguration.defaultConfiguration()`**

Do **not** add `bundleConfiguration` — the current React Native API doesn’t use it (that would cause “extra argument” errors).

Then clean and build:

```bash
cd ios
rm -rf build Pods
pod install
cd ..
npx expo run:ios
```

### Option C: Clean everything and reinstall

If it still fails, do a full clean and reinstall so the patched file is the one that gets compiled:

```bash
cd /Users/cheyoungahn/Desktop/compass
npm install
npx patch-package
cd ios
rm -rf build Pods Podfile.lock
pod install
cd ..
npx expo run:ios
```

---

## xcodebuild error 65 (build failed)

If you see **"xcodebuild" exited with error code 65**, the iOS build itself failed (not the simulator). Do this:

### 1. See the real error

Run the build and scroll up in the terminal to find the first **error:** line (often in red). It might be:

- **Signing:** "Signing for 'Compass' requires a development team"
- **Module / Swift:** "No such module" or a Swift compilation error
- **Pod / dependency:** Something in CocoaPods failed

To get a cleaner log:

```bash
cd /Users/cheyoungahn/Desktop/compass
npx expo run:ios 2>&1 | tee build.log
```

Then open `build.log`, search for `error:` or `Error:`, and fix the first error shown.

### 2. Point Xcode at the right app (if Simulator not found)

If the message says the Simulator can't be found or suggests `xcode-select`:

```bash
sudo xcode-select -s /Applications/Xcode.app
```

Enter your Mac password when prompted, then run `npx expo run:ios` again.

### 3. Clean and rebuild

Sometimes a clean build fixes code 65:

```bash
cd ios
xcodebuild clean -workspace Compass.xcworkspace -scheme Compass
cd ..
npx expo run:ios
```

(If there is no `ios` folder yet, run `npx expo prebuild` first, then the clean and `run:ios`.)

### 4. Reinstall pods

If the error mentions Pods or a native module:

```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

---

## Simulator install error (code 204 / Mach -308)

If `npx expo run:ios` builds successfully but fails at "Installing on iPhone ..." with:

```
Error: xcrun simctl install ... exited with non-zero code: 204
Mach error -308 - (ipc/mig) server died
```

the Simulator process is in a bad state. Try these in order:

## 1. Quit Simulator and run again

1. **Quit the Simulator app** (Simulator → Quit Simulator, or Cmd+Q).
2. Run again:
   ```bash
   npx expo run:ios
   ```
   Expo will boot a fresh simulator and install the app.

## 2. Shut down all simulators, then run

In Terminal:

```bash
xcrun simctl shutdown all
npx expo run:ios
```

## 3. Use a different simulator

List devices:

```bash
xcrun simctl list devices available
```

Run on a specific device (e.g. iPhone 16):

```bash
npx expo run:ios --device "iPhone 16"
```

Or pick from the list when prompted:

```bash
npx expo run:ios --device
```

## 4. Erase the simulator

In the **Simulator** app:

- **Device** → **Erase All Content and Settings...**

Then run `npx expo run:ios` again.

## 5. Restart your Mac

If the simulator keeps failing, a full restart often clears "server died" errors.

---

After any of these, the build output is already on disk, so you can also try opening the project in Xcode and running from there:

```bash
open ios/Compass.xcworkspace
```

Then in Xcode: pick your simulator and press the Run (Play) button.
