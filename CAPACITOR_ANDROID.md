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

Android Pi sign-in opens `pi://smajpihub.com/signin/android` directly in Pi Browser. The bridge authenticates with the Pi SDK and returns through `smajpihub://oauth/pi`. Android validates the random state, verifies the access token through Pi `/v2/me`, and signs into the existing SMAJ backend. The HTTPS callback remains available as a fallback.

Before Play release, update `frontend/public/.well-known/assetlinks.json` with the SHA-256 fingerprint of the final Play App Signing certificate.

## Native Android capabilities

The Android shell includes official Capacitor plugins for camera and gallery access, clipboard, device information, files, GPS location, local notifications, network state, push notifications, and the Android share sheet. `frontend/src/lib/nativeCapabilities.ts` is the shared API for feature pages, while `NativeRuntimeBridge` handles app-wide network and notification events.

Permissions are requested only from the action that needs them. The app does not request camera, location, files, or notification access during startup.

Examples:

- Product/profile photo: call `chooseNativeImage()` when the user taps the photo action.
- Location: call `getNativeLocation()` when the user taps **Use my location**.
- File upload: call `chooseNativeFiles()` from the upload action.
- Share/copy: call `shareNative()` or `writeNativeClipboard()`.
- Phone reminder: call `scheduleNativeReminder()` after the user chooses a reminder.

### Firebase push setup still required

The Android push plugin is installed, but remote push delivery requires external Firebase configuration that is not stored in this repository:

1. Create/register `com.smajpihub.mobile` in Firebase.
2. Add the Firebase Android configuration to the build environment as `frontend/android/app/google-services.json`.
3. Add a backend endpoint that associates each FCM registration token with the authenticated SMAJ user/device.
4. Configure Firebase Admin credentials on the backend and send FCM notifications from message/order/job/course events.

The current backend web-push/VAPID implementation remains unchanged for browsers. Do not commit Firebase Admin private keys. Biometric sign-in is also intentionally not enabled until a maintained biometric plugin and a server-side re-authentication policy are selected.
## Offline mode

The app monitors both browser and native Android network state. When connectivity is lost it shows a global **You're offline** banner, keeps the cached application shell available, and serves eligible previously loaded read-only API responses (products, services, jobs, courses, education, and profiles) from IndexedDB for up to 24 hours.

All API mutations are blocked while offline. Payments and other financial operations are never queued or replayed. When connectivity returns, the app displays **Back online** and emits `smaj:connection-restored` so individual data-heavy screens can refresh or synchronize explicitly permitted non-financial drafts.
