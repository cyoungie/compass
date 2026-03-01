# Xcode: Check Link Binary With Libraries (AsyncStorage)

Your project uses **CocoaPods**. The Compass app doesn’t link each pod by hand; it links **`libPods-Compass.a`**, which includes RNCAsyncStorage and everything else. Use these steps to confirm that’s set up and to force a clean build.

## 1. Open the workspace (not the .xcodeproj)

**From the project root** (where `package.json` lives):

```bash
cd /Users/cheyoungahn/Desktop/compass
open ios/Compass.xcworkspace
```

- The path must be **inside your project**: `.../Desktop/compass/ios/Compass.xcworkspace`.  
  If you use `.../ios/Compass.xcworkspace` from your home folder, that file won’t exist.
- If **`Compass.xcworkspace` doesn’t exist**, create it by running:
  ```bash
  cd /Users/cheyoungahn/Desktop/compass/ios
  pod install
  cd ..
  open ios/Compass.xcworkspace
  ```
- Always open **`Compass.xcworkspace`**, not `Compass.xcodeproj`, so Xcode sees the Pods.

---

## 2. Confirm the Compass target links Pods

1. In the **left sidebar**, click the blue **Compass** project icon (top of the list).
2. Under **TARGETS**, select **Compass**.
3. Open the **Build Phases** tab.
4. Expand **Link Binary With Libraries**.
5. You should see **`libPods-Compass.a`** in the list.  
   - If it’s there, the app target is correctly linking all Pods (including RNCAsyncStorage).
   - If it’s **missing**, click **+**, then choose **`libPods-Compass.a`** (under “Workspace” or “Pods”) and add it.

---

## 3. Confirm Pods-Compass includes RNCAsyncStorage (optional)

1. In the left sidebar, expand **Pods** (the Pods project).
2. Under **Pods** → **TARGETS**, select **Pods-Compass**.
3. Open **Build Phases** → **Link Binary With Libraries**.  
   You should see **`RNCAsyncStorage`** (or libRNCAsyncStorage) in the list among many other pods.  
   If RNCAsyncStorage is there, the Pods aggregate is correct; you don’t need to add anything to the main app target.

---

## 4. Clean and rebuild so the link actually runs

1. In the menu bar: **Product** → **Clean Build Folder** (Shift+Cmd+K).
2. Wait for it to finish.
3. **Product** → **Build** (Cmd+B).
4. When the build succeeds, run the app (e.g. **Product** → **Run** or the Play button) on your simulator or device.

This forces Xcode to rebuild the Pods (including RNCAsyncStorage) and link them into the Compass app again.

---

## 5. If libPods-Compass.a was missing

If you had to add **`libPods-Compass.a`** in step 2:

- Make sure the **Compass** target’s **Build Settings** use the Pods xcconfig:
  - **Build Settings** → search for **“Based on”** or **“Configuration”**.
  - For **Debug** and **Release**, **“Based on Configuration File”** should be set to **`Pods-Compass.debug.xcconfig`** and **`Pods-Compass.release.xcconfig`** (CocoaPods usually sets this; if not, add it).

Then do step 4 again (Clean Build Folder → Build → Run).

---

## Summary

- **Compass** should link **`libPods-Compass.a`** (Link Binary With Libraries).
- **Pods-Compass** includes RNCAsyncStorage; you don’t link RNCAsyncStorage directly in the Compass target.
- After any change, **Product → Clean Build Folder**, then **Build**, then **Run**.
