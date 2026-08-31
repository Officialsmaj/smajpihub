# SMAJ PI HUB Android

A separate React Native/Expo Android client for SMAJ PI HUB. It is not a WebView and does not replace `frontend/`.

## Included

- Expo SDK 57 and Expo Router native tabs.
- Home, Services, Search, Messages and You tabs.
- Fifteen-service directory with shared launch statuses.
- Shared typed API client targeting the existing SMAJ backend.
- Expo SecureStore authentication storage.
- Pi Browser handoff without leaking tokens through URLs.
- EAS preview APK and production AAB profiles.
- Android application ID: `com.smajpihub.mobile`.

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run typecheck
npm run doctor
npm run android
```

Use a physical Android device with Expo Go or an Android emulator. Set `EXPO_PUBLIC_API_BASE_URL` only when testing another backend.

## Authentication

`AuthProvider.signInWithPiAuthResult` accepts a Pi authorization result and sends it to the existing `/user/signin` endpoint. Tokens are stored in device secure storage. The production native callback must not be enabled until the supported Pi Android authorization return flow is confirmed and implemented as a one-time code exchange.