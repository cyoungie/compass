# Install CocoaPods (when Expo says it can’t)

Run these in **Terminal** (macOS **Terminal.app**, not Cursor’s terminal).

**Note:** Current CocoaPods needs **Ruby 3+**. Your Mac’s built-in Ruby is 2.6, so `gem install cocoapods` may fail with a dependency error. If so, use the Homebrew option below.

---

## Option 1: User install (no password)

```bash
# Create the directory if needed
mkdir -p ~/.gem/ruby/2.6.0/bin

# Install CocoaPods into your user directory (no sudo)
gem install --user-install cocoapods

# Add gem executables to PATH for this session
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"

# Make it permanent (add to your shell config)
echo 'export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
which pod
pod --version
```

Then from your project:

```bash
cd /Users/cheyoungahn/Desktop/compass
npx expo run:ios
```

---

## Option 2: Use sudo (needs Mac password)

```bash
sudo gem install cocoapods
```

When it asks for a password, type your **Mac login password** (nothing will appear as you type), then press Enter.

Then:

```bash
cd /Users/cheyoungahn/Desktop/compass
npx expo run:ios
```

---

## Option 3: Install Homebrew, then CocoaPods

If Option 1 or 2 fails (e.g. Ruby 2.6 / dependency errors), install Homebrew first, then CocoaPods:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, run the command it prints to add `brew` to your PATH (something like):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile && eval "$(/opt/homebrew/bin/brew shellenv)"
```

Then:

```bash
brew install cocoapods
cd /Users/cheyoungahn/Desktop/compass
npx expo run:ios
```

---

## If you don’t need real voice right now

You can keep using **Expo Go** and skip the dev build:

```bash
npx expo start
```

Open the app in Expo Go. On the voice onboarding screen, tap **“Continue with sample”** to use the mock transcript and finish onboarding. Real ElevenLabs voice will only work after CocoaPods is installed and you run `npx expo run:ios`.
