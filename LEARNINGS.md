# Learnings

## Supabase Auth in Expo

### 1. Folder placement must match tsconfig paths
AGENTS.md architecture folders (`components/`, `hooks/`, `lib/`, `providers/`, `constants/`) must live inside `src/`. The tsconfig `@/*` alias maps to `./src/*`, so `@/lib/supabase` resolves to `src/lib/supabase.ts`. If you put them at root level, imports break.

### 2. Auth state changes must be handled synchronously
When `onAuthStateChange` fires, use the `session` parameter directly instead of calling `getClaims()`:

```tsx
// ❌ Broken: async getClaims() introduces a race condition
supabase.auth.onAuthStateChange(async (_event, _session) => {
  const { data } = await supabase.auth.getClaims()
  setClaims(data?.claims ?? null)
})

// ✅ Correct: use session synchronously
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    setClaims({ sub: session.user.id })
  } else {
    setClaims(null)
  }
})
```

The async `getClaims()` call causes two problems:
- **Sign-in delay:** Navigation doesn't react immediately because the async gap leaves `claims` at its old value
- **Sign-out not triggering:** `getClaims()` fails (errors) when there's no session, so `setClaims(null)` never fires

### 3. `Stack.Screen name` references route groups, not screens inside them
In Expo Router's `Stack.Protected`, reference route groups by their directory name only:

```tsx
// ❌ Broken
<Stack.Screen name="(auth)/login" />

// ✅ Correct
<Stack.Screen name="(auth)" />
```

The group's `_layout.tsx` handles which screen to display inside it.

### 4. Use `AuthSession.makeRedirectUri()` for OAuth redirects
Custom scheme URLs like `ord://google-auth` don't work reliably with `WebBrowser.openAuthSessionAsync` on native. Use `expo-auth-session`:

```tsx
import * as AuthSession from "expo-auth-session";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "ord",
  path: "google-auth",
});
```

This generates a proper redirect URI that works across platforms.
