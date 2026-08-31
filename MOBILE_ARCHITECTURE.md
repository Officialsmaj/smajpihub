# SMAJ PI HUB Web + Android Architecture

SMAJ PI HUB now has two independent clients and one shared platform:

- `frontend/` -- the existing React/Vite Web and Pi Browser application.
- `mobile/` -- the separate Expo/React Native Android application.
- `backend/` -- the existing Express API used by both clients.
- `packages/` -- platform-neutral TypeScript contracts, API access and design tokens.

The existing web application has not been moved, wrapped in a WebView or replaced.

## Shared data flow

Both clients use `https://smajpihub.onrender.com` by default and therefore share MongoDB users, products, orders, messages, jobs, courses, profiles, notifications and service records.

## Shared packages

- `@smaj/shared-types`: user, authentication, service and API contracts.
- `@smaj/api-client`: fetch-based client that works in browsers and React Native.
- `@smaj/design-tokens`: SMAJ colors, spacing and radii.

Existing web/backend models can move into these packages incrementally. They are intentionally not moved in the first commit, avoiding deployment regressions.

## Authentication boundary

The backend already accepts an HttpOnly web session or a Pi access token in `Authorization`/`X-SMAJ-Access-Token`. Android stores an accepted token using Expo SecureStore and resolves the same user by Pi UID.

The current Pi Browser handoff does not return a native token. Do not pass a token in a URL. Before Play Store authentication is enabled, implement an approved one-time authorization-code callback after confirming Pi's supported Android flow. Until then, login and Pi payment actions open Pi Browser.

## Commands

```powershell
npm install
npm run check:shared
npm run mobile:typecheck
npm run mobile:doctor
npm run mobile:android
```

Existing commands continue to run inside `frontend/` and `backend/` unchanged.

## Release sequence

1. Configure `mobile/.env` from `.env.example`.
2. Confirm Android package `com.smajpihub.mobile` in Google Play Console.
3. Configure an Expo/EAS project and Android signing credentials.
4. Complete and security-review the Pi native callback flow.
5. Run `npx eas-cli build --platform android --profile preview` for internal APK testing.
6. Run the production profile to generate the Play Store AAB.