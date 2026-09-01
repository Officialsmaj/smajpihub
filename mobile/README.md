# SMAJ PI HUB Android

A separate React Native/Expo Android client for SMAJ PI HUB. It is not a WebView and does not replace `frontend/`.

## Included

- Expo SDK 57 and Expo Router native tabs.
- Home, Services, Search, Messages and You tabs.
- Fifteen-service directory with shared launch statuses.
- Shared typed API client targeting the existing SMAJ backend.
- Pi OAuth implicit login with cryptographic state validation.
- Pi identity verification through `/v2/me` and the existing `/user/signin` backend.
- Expo SecureStore access-token and pending-state storage.
- HTTPS Android App Link callback without token relay through an unverified custom scheme.
- EAS preview APK and production AAB profiles.
- Android application ID: `com.smajpihub.mobile`.

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run test:oauth
npm run typecheck
npm run doctor
npm run android
```

The public Pi OAuth Client ID is supplied through the build environment and the `https://smajpihub.com/signin/callback` redirect URI is declared in `.env.example`.

## Required external configuration

1. Verify `smajpihub.com` in Pi Developer Portal.
2. Enable Pi Sign-in and register `https://smajpihub.com/signin/callback` exactly.
3. Build/sign the Android app and obtain its SHA-256 signing certificate fingerprint.
4. Replace the fingerprint in `mobile/assetlinks.example.json`, then publish it as `https://smajpihub.com/.well-known/assetlinks.json`.
5. Confirm Android reports `smajpihub.com` as a verified App Link before live login testing.

The signing fingerprint is created by Google Play or EAS and is not present in source control, so the repository cannot safely invent or register it.

## Authentication behavior

The app creates 32 cryptographically random bytes for OAuth `state`, stores the state in SecureStore, and opens `https://accounts.pinet.com/oauth/authorize` with `response_type=token`. Android accepts only the exact verified callback path. The app validates `state`, consumes it once, verifies the token with Pi `/v2/me`, sends the verified identity and token to the existing SMAJ `/user/signin` endpoint, and stores the accepted token only in SecureStore.

On restart, the token is restored from SecureStore and `/user` resolves the same backend account. Logout removes both the token and any pending state. Because Web and Android use the same Pi OAuth Client ID and backend, Pi returns the same app-specific UID for the same user.

If Android App Link verification fails, the web callback page removes the fragment immediately and asks the user to retry from the installed app; it never stores or displays the access token.

## Device test checklist

- New login opens Pi authorization and returns to the You tab.
- Cancel and invalid-state responses do not create a session.
- Closing and reopening the app restores the signed-in user.
- Logout survives an app restart.
- The same Pi user shows the same SMAJ profile on Android and Pi Browser.