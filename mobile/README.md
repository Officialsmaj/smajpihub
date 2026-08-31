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

The public Pi OAuth Client ID and `smajpihub://oauth/pi` redirect URI are declared in `.env.example`. Register that redirect URI exactly with the OAuth provider before enabling native login.

## Authentication

`AuthProvider.signInWithPiAuthResult` accepts a Pi authorization result and sends it to the existing `/user/signin` endpoint. Accepted tokens are stored in device secure storage. The provider currently supports OAuth implicit flow and issues a public Client ID without a client secret. Native login must validate the OAuth state, read the returned access token from the URL fragment, remove it from navigation history, verify it through the existing backend, and store it only in Expo SecureStore.
