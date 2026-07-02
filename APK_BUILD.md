# Building the Android APK (PWABuilder)

This app is already a fully valid PWA (manifest + service worker + icons), so PWABuilder can package it into an Android app with no coding required.

## Prerequisite: the app must be live on the internet

PWABuilder needs a real HTTPS URL to scan — it can't read files from your computer. If you haven't already:

1. Push this repo to GitHub (see main README).
2. Go to your repo → **Settings → Pages** → set source to the `main` branch, root folder.
3. GitHub will give you a URL like:
   `https://YOUR_USERNAME.github.io/GSY_FitLog/`
4. Open that URL and confirm the app loads and works correctly.

## Steps to generate the APK

1. Go to **https://www.pwabuilder.com**
2. Paste your GitHub Pages URL into the box and click **Start**.
3. PWABuilder scans the site and shows a score for Manifest, Service Worker, and Security (HTTPS). This app is already configured to score well on all three.
4. Click **Package for Stores** (or "Build My PWA").
5. Choose **Android**.
6. You'll see packaging options:
   - **Package ID**: reverse-domain style, e.g. `com.yourname.fitlog`
   - **App name**: GSY FitLog
   - **Signing key**: choose **"Create a new signing key"** if this is your first build — PWABuilder generates and gives you a `.keystore` file. **Download and keep this file safe** — you'll need the exact same key for any future updates to the app.
7. Click **Generate**. PWABuilder builds the package and gives you a `.zip` download containing:
   - A signed `.apk` (or `.aab` if you chose Google Play bundle) — install this directly on an Android phone
   - Your signing key info (`signing-key-info.txt`) — keep this, it has your key's SHA-256 fingerprint

## Installing the APK on your phone

1. Transfer the `.apk` file to your Android phone (email, Drive, USB, etc.)
2. Open it on the phone — you may need to allow "Install from unknown sources" the first time
3. It installs and runs like any normal app, using your existing manifest icon and theme color

## Optional: verified "no browser bar" experience (Digital Asset Links)

By default, the Android app may show a small address bar at first launch until ownership of the domain is verified. To remove it fully:

1. PWABuilder gives you a `assetlinks.json` snippet during the Android packaging step, containing your app's SHA-256 fingerprint.
2. Create the file `.well-known/assetlinks.json` in your repo with that content.
3. Push it and make sure it's reachable at:
   `https://YOUR_USERNAME.github.io/GSY_FitLog/.well-known/assetlinks.json`
4. Rebuild/reinstall the app — the browser bar disappears and it behaves like a native app.

## Publishing to Google Play (optional, later)

If you eventually want it on the Play Store instead of just sideloading:
- Choose `.aab` (Android App Bundle) instead of `.apk` during PWABuilder packaging
- You'll need a one-time $25 Google Play Developer account
- Upload the `.aab` and the `signing-key-info.txt` details during Play Console setup

## Updating the app later

Whenever you change the code:
1. Push the changes to GitHub (GitHub Pages updates automatically)
2. Go back to PWABuilder, re-scan the same URL, and regenerate the Android package
3. Use **the same signing key** from your first build, or Android will treat it as a different app and won't let existing users update
