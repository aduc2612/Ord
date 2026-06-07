# Research: Sentry Integration for Expo React Native Project (Ord)

## Summary

Integrating Sentry into an Expo managed project (SDK 56) requires: installing `@sentry/react-native`, adding the Expo config plugin to `app.json`, configuring `metro.config.js` with `getSentryExpoConfig`, initializing Sentry in `app/_layout.tsx` with `Sentry.init()` and `Sentry.wrap()`, and setting environment variables for the DSN and auth token. The Sentry SDK skill recommends using the wizard CLI (`npx @sentry/wizard@latest -i reactNative`) for the fastest path, which handles all native config automatically.

## Findings

### 1. Required Packages

- **`@sentry/react-native`** — Core SDK (Expo SDK 50+ required — Ord is on SDK 56, so this is the correct package).
- **`sentry-expo`** — Legacy package for Expo SDK <50. **Do not use.** Ord is on SDK 56.
- No additional native packages needed — `@sentry/react-native` includes the config plugin that handles native builds.

### 2. Config Plugin Setup (`app.json`)

The `@sentry/react-native/expo` config plugin must be added to the `plugins` array in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "YOUR_PROJECT_SLUG",
          "organization": "YOUR_ORG_SLUG",
          "disableAutoUpload": false
        }
      ]
    ]
  }
}
```

Alternatively, configure via `app.config.js` to interpolate env vars:

```javascript
export default {
  expo: {
    plugins: [
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: process.env.SENTRY_PROJECT,
          organization: process.env.SENTRY_ORG,
          disableAutoUpload: process.env.NODE_ENV === "development",
        },
      ],
    ],
  },
};
```

**Key detail:** The plugin handles source map and dSYM upload during native builds automatically. Set `disableAutoUpload: true` during local dev to speed up builds.

### 3. Metro Config Setup

A `metro.config.js` file is required at the project root using the Sentry Expo Metro config:

```javascript
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const config = getSentryExpoConfig(__dirname);
module.exports = config;
```

If `metro.config.js` doesn't exist yet, run `npx expo customize metro.config.js` and then replace contents with the above. **Ord does not currently have a `metro.config.js`** — this will need to be created.

### 4. Initialization Code (Expo Router)

Sentry must be initialized at the root of the app. For Expo Router, this goes in `src/app/_layout.tsx`:

```typescript
import { isRunningInExpoGo } from "expo";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "YOUR_SENTRY_DSN",
  sendDefaultPii: true,

  // Tracing
  tracesSampleRate: 1.0,        // lower to 0.1 in production
  profilesSampleRate: 1.0,      // profiling on subset of traced transactions

  // Session Replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1, // sample 10% of all sessions

  // Logging (SDK ≥7.0.0)
  enableLogs: true,

  // Mobile Replay
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
  ],

  // Native frames tracking (disable in Expo Go)
  enableNativeFramesTracking: !isRunningInExpoGo(),

  environment: __DEV__ ? "development" : "production",
});

// Then wrap the root component
function RootLayout() {
  // ... existing component ...
}

export default Sentry.wrap(RootLayout);
```

**Crucial detail for Expo Router:** The `Sentry.NavigationContainer` wrapper is **not needed** for Expo Router projects — navigation spans are captured automatically by Expo Router integration.

**`Sentry.wrap()`** is required — it wraps the root component in a React error boundary to capture render errors.

### 5. Source Map Upload Configuration

The `@sentry/react-native/expo` config plugin handles source map and dSYM upload automatically during native builds (EAS Build or `expo run:ios/android --configuration Release`).

Requirements:
- **`SENTRY_AUTH_TOKEN`** must be set as an environment variable during builds — either locally or as an EAS secret.
- For `eas build`, set it as a secret: `eas secret:create --name SENTRY_AUTH_TOKEN --value "sntrys_..."`
- The auth token comes from Sentry's Settings → Account → API → Auth Tokens.

### 6. Environment Variables Needed

| Variable | Purpose | Where to set |
|----------|---------|-------------|
| `EXPO_PUBLIC_SENTRY_DSN` | Public DSN used in `Sentry.init()` | `.env` file |
| `SENTRY_AUTH_TOKEN` | Auth token for source map upload | Local env or EAS secret |
| `SENTRY_ORG` | Organization slug | For config plugin |
| `SENTRY_PROJECT` | Project slug | For config plugin |
| `SENTRY_DISABLE_AUTO_UPLOAD` | Set `true` for local dev builds | Local env |
| `SENTRY_EAS_BUILD_CAPTURE_SUCCESS` | Set `true` to capture successful EAS builds | EAS secrets |

**Important:** `EXPO_PUBLIC_SENTRY_DSN` is safe to embed in the client bundle (it's public). `SENTRY_AUTH_TOKEN` is a build-time secret — **never** commit it or use it in `Sentry.init()`.

### 7. Expo-Specific Gotchas and Requirements

1. **Expo SDK ≥50 required** — `@sentry/react-native` ≥6.0.0 requires Expo SDK 50+. Ord is on SDK 56, so this is satisfied.

2. **Expo Go limitations:** Native features (session replay, slow/frozen frames, TTID/TTFD) do not work in Expo Go. Use `isRunningInExpoGo()` guard:
   ```typescript
   enableNativeFramesTracking: !isRunningInExpoGo()
   ```

3. **EAS Build hooks** — Sentry provides hooks to capture build success/failure:
   ```json
   // package.json
   {
     "scripts": {
       "eas-build-on-complete": "sentry-eas-build-on-complete"
     }
   }
   ```
   Set `SENTRY_DSN` as an EAS secret for this (separate from the app's DSN).

4. **No metro.config.js exists yet** — must be created from scratch.

5. **app.json already has a long plugins array** — the Sentry config plugin must be appended to the existing list.

6. **The project uses `__DEV__`** for environment detection (from React Native) — this works with Sentry's `environment` option.

### 8. Differences Between the Two Guides

| Aspect | Sentry Manual Setup Guide | Expo Sentry Guide |
|--------|--------------------------|-------------------|
| **Recommended approach** | Wizard CLI (`npx @sentry/wizard@latest -i reactNative`) as the primary path | Manual setup with config plugin, focused on compatibility with Expo tooling |
| **Metro config** | `getSentryExpoConfig(__dirname)` | Same — `getSentryExpoConfig` from `@sentry/react-native/metro` |
| **Source map upload** | Wizard handles it automatically | Emphasizes EAS Build integration and using `disableAutoUpload` for dev |
| **Initialization** | Integrated in `_layout.tsx` for Expo Router | Same approach |
| **EAS hooks** | Covered in SDK skill reference | Covered as optional enhancement |
| **Emphasis** | Full feature set (profiling, replay, logging) | Core error monitoring + tracing, with notes on Expo-specific constraints |

**Bottom line:** Both guides converge on the same setup. The Expo guide is a subset focused on what's relevant to Expo developers, while the Sentry guide covers more optional features.

## Sources

### Primary Sources (Fetched via Sentry SDK Skill)
- **Sentry React Native SDK Skill** (`https://skills.sentry.dev/sentry-react-native-sdk/SKILL.md`) — The authoritative Sentry skill containing complete Expo setup instructions, initialization code, config plugin reference, and environment variable documentation.
- **Sentry SDK Setup Router** (`https://skills.sentry.dev/sentry-sdk-setup/SKILL.md`) — Platform detection and skill lookup guide.
- **Sentry Docs: React Native Manual Setup (Expo)** (`https://docs.sentry.io/platforms/react-native/manual-setup/expo/`) — Referenced by SDK skill as source truth.
- **Expo Docs: Using Sentry** (`https://docs.expo.dev/guides/using-sentry/`) — Referenced by SDK skill for Expo-specific guidance.

### Secondary Sources (From Project Context)
- **Ord's `package.json`** — Confirmed Expo SDK 56, React Native 0.85.3, `@react-navigation/native` v7.
- **Ord's `app.json`** — Current plugins list, no Sentry config yet.
- **Ord's `src/app/_layout.tsx`** — Current root layout structure, Sentry init injection point identified.
- **Ord's `.env`** — Contains `EXPO_PUBLIC_*` env vars; `EXPO_PUBLIC_SENTRY_DSN` will be added here.

### Dropped Sources
- None — all relevant sources were used.

## Gaps

1. **DSN value unknown** — The actual Sentry DSN for the Ord project is not provided. The user needs to create a Sentry project and obtain it.
2. **Sentry org/project slugs unknown** — The user needs to decide on/create a Sentry organization and project.
3. **Auth token unknown** — User needs to generate an auth token from Sentry settings for source map uploads.
4. **Production sample rates not finalized** — The initial setup should use safe defaults; production tuning can happen later.
5. **No `metro.config.js` exists** — Must be created from scratch (see Finding 3).
6. **EAS Build hooks** — Optional; user preference needed.

## Suggested Next Steps

1. Create a Sentry account and project (if not already done)
2. Obtain the DSN, org slug, and project slug
3. Generate a Sentry auth token
4. Add `EXPO_PUBLIC_SENTRY_DSN` to `.env`
5. Proceed with implementation: install package, create `metro.config.js`, update `app.json`, update `_layout.tsx`
