# Meta-Prompt: Planner — Sentry Integration for Ord

## Goal

Produce a precise, step-by-step implementation plan for integrating Sentry error monitoring + tracing + session replay into the Ord Expo SDK 56 project. The plan must be concrete enough that an implementer agent can execute it file-by-file without rediscovering the project structure, and must flag all user decisions and manual steps.

## Context/Evidence

All sources are in `C:/Ord/.agents/chain-runs/c43b9a8a/`:
- `research.md` — Full Sentry SDK skill findings, package selection rationale, config plugin details, env var guide, Expo-specific gotchas
- `context.md` — Project structure, current file contents, architecture rules, file change inventory, risk assessment

Read both before writing the plan.

Key source-backed facts:
1. Project uses `src/` directory with `@/*` alias → Sentry init goes in `src/app/_layout.tsx`
2. Metro config does NOT exist → must create from scratch at project root
3. `app.json` has 11 plugins already → Sentry plugin must be appended
4. `.env` uses `EXPO_PUBLIC_*` pattern → DSN should follow as `EXPO_PUBLIC_SENTRY_DSN`
5. `.gitignore` already excludes `.env` and `.env*.local`
6. `@sentry/react-native` is correct package for Expo SDK 56 (NOT `sentry-expo`)
7. Expo Router project → `Sentry.NavigationContainer` NOT needed
8. AuthProvider, PowerSyncProvider, ToastProvider, NetworkToastProvider wrap the tree
9. Current root layout has `SplashScreenController` + `RootNavigator` inside providers

## Success Criteria

The plan must satisfy all of:
1. [ ] Every modified/created file is listed with exact path (e.g., `src/app/_layout.tsx`)
2. [ ] Every change to each file is described concretely (what line/block to add, what to change, what to leave unchanged)
3. [ ] All user-provided values (DSN, org slug, project slug, auth token) are clearly marked as placeholders the user must fill in
4. [ ] All manual steps the user must perform (create Sentry project, generate token, etc.) are explicitly called out
5. [ ] Edge cases are addressed: app running in Expo Go, dev vs production sample rates, `isRunningInExpoGo()` guard
6. [ ] Verification steps are included: how to test the integration end-to-end
7. [ ] No UI/logic changes outside Sentry setup are proposed
8. [ ] The plan asks the user for all decisions (sample rates, EAS hooks, replay opt-in) before any implementation begins

## Hard Constraints

- **DO NOT** modify any UI screens, components, stores, DB schema, providers, or routing logic beyond what's needed for Sentry init
- **DO NOT** install any packages other than `@sentry/react-native` without asking
- **DO NOT** use `sentry-expo` (legacy) — must use `@sentry/react-native`
- **DO NOT** add `Sentry.NavigationContainer` — Expo Router auto-tracks navigation
- **DO NOT** commit `SENTRY_AUTH_TOKEN` to any file — it's a build-time env var
- **DO NOT** change `babel.config.js` unless proven necessary
- **MUST** use `EXPO_PUBLIC_SENTRY_DSN` for the DSN (follows existing `.env` pattern)
- **MUST** include `isRunningInExpoGo()` guard for `enableNativeFramesTracking`
- **MUST** wrap the root export with `Sentry.wrap()`

## Suggested Approach

1. **Read context documents** (research.md + context.md)
2. **Identify all files that change** — list them with their exact current state
3. **Identify all user decisions needed** — group them into a question list
4. **Structure the plan**:
   - Phase 0: Pre-requisites (what user must do externally) — create Sentry project, get DSN, generate auth token
   - Phase 1: Dependencies — install `@sentry/react-native`
   - Phase 2: Configuration — create `metro.config.js`, update `app.json` with plugin
   - Phase 3: Initialization — add `Sentry.init()` and `Sentry.wrap()` to `_layout.tsx`
   - Phase 4: Environment — add `EXPO_PUBLIC_SENTRY_DSN` to `.env`, document other vars
   - Phase 5: Verification — how to test each feature (errors, traces, replays)
   - Phase 6: Production tuning — sample rate guidance
5. **Flag optional enhancements** (EAS build hooks, profiling, etc.) for user decision
6. **Write the plan** as a clear markdown document at a specified output path

## Validation

After writing the plan, verify:
- Run `grep -r "sentry-expo" src/` → should return nothing (wrong package)
- Run `grep -r "NavigationContainer" src/app/_layout.tsx` → confirm it only has `Stack` from `expo-router` (not `Sentry.NavigationContainer`)
- Check `src/app/_layout.tsx` doesn't already have `Sentry.init` (no prior setup)
- Verify the plan file doesn't contain `SENTRY_AUTH_TOKEN` as a hardcoded value

## Stop/Escalation Rules

- If unable to determine the correct structure of `_layout.tsx` or `app.json`, escalate via `intercom` with specific questions
- If the user has not yet created a Sentry project/DSN, the plan should stop at Phase 0 and ask before proceeding
- If the user's docs URLs contain conflicting instructions vs the SDK skill, flag the conflict with evidence and ask
- Do not proceed to implementation — output ONLY the plan

## Output Expectation

Write the plan to: `C:/Ord/.agents/chain-runs/c43b9a8a/plan.md`

It should be a complete document the user and implementer can follow independently.

## Resolved Questions & Assumptions

**Resolved:**
- ✅ `@sentry/react-native` ≥6.0.0 is correct for Expo SDK 56 ✓
- ✅ No additional native packages needed (config plugin handles it)
- ✅ Expo Router auto-captures navigation — no `Sentry.NavigationContainer`
- ✅ `EXPO_PUBLIC_SENTRY_DSN` follows existing env var pattern
- ✅ `isRunningInExpoGo()` from `expo` package is the correct guard

**Needs User Decision:**
- ❓ Sentry DSN value
- ❓ Sentry org slug
- ❓ Sentry project slug
- ❓ Enable/disable session replay?
- ❓ Enable/disable profiling?
- ❓ Enable EAS build hooks?
- ❓ Production `tracesSampleRate` (recommend 0.1-0.2 default)
- ❓ Production `replaysSessionSampleRate` (recommend 0.05 default)
