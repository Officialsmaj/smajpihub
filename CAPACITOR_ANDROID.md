# SMAJ PI HUB Capacitor Android

This Android project packages the existing React/Vite application, so Android uses the same routes, CSS, images, backend, database, users, and responsive private pages as the web and Pi Browser version.

## Requirements

Install Node.js 24, JDK 21, and Android Studio with Android SDK 36.

## Open and test

```powershell
cd frontend
npm ci
npm run android:sync
npm run android:open
```

Select a connected Android phone in Android Studio and press Run. The application ID is `com.smajpihub.mobile`.

## Build an APK

```powershell
cd frontend
npm run android:sync
cd android
.\gradlew.bat assembleDebug
```

The installable APK is created at:

`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Build for Google Play

In Android Studio, open **Build > Generate Signed Bundle / APK**, choose **Android App Bundle**, and use the protected Play upload key. The AAB is written under:

`frontend/android/app/build/outputs/bundle/release/`

Never commit the keystore or its passwords.

## Pi sign-in

Pi OAuth uses `https://smajpihub.com/signin/callback`, validates a random state, verifies the access token through Pi `/v2/me`, and signs into the existing SMAJ backend. Android accepts the HTTPS App Link and the `smajpihub://oauth/pi` fallback.

Before Play release, update `frontend/public/.well-known/assetlinks.json` with the SHA-256 fingerprint of the final Play App Signing certificate.
