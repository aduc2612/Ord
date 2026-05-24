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

## PowerSync + Supabase Sync

### 5. `uploadData` must always call `transaction.complete()`

If `uploadData` throws an error before `transaction.complete()`, the CRUD transaction stays in the queue and **blocks ALL subsequent uploads** for every table. Always catch errors and call `complete()`:

```ts
// ❌ Broken: throw blocks the entire queue
for (const op of transaction.crud) {
  try { /* supabase call */ }
  catch (error) { throw error; } // queue stuck forever
}
await transaction.complete();

// ✅ Correct: log and continue, always complete
for (const op of transaction.crud) {
  try { /* supabase call */ }
  catch (error) { console.error(error); continue; }
}
await transaction.complete();
```

### 6. `db.watch()` is reactive — don't manually re-query after mutations

Calling `await loadNotes()` after `db.insert()` creates a race with the watch's `onResult` callback. The watch already fires automatically after any DB change. Manual re-queries cause UI flickers and empty states.

### 7. Every table needs `updatedAt` for PowerSync sync reconciliation

PowerSync uses `updated_at` for conflict resolution and checkpoint tracking. Tables without it (like `notes` initially) are vulnerable to being overwritten during sync. Add `updatedAt: integer("updated_at").notNull()` to every Drizzle table and `updated_at: column.integer` to every PowerSync Table definition.

### 8. Sync rules config must include every table

`powersync/sync-config.yaml` must have a stream for each table. Tables not listed won't sync to Supabase, even if they exist locally and in the app schema:

```yaml
notes:
  auto_subscribe: true
  queries:
    - SELECT * FROM notes WHERE user_id = auth.user_id()
```

### 9. PostgreSQL `INTEGER` is 32-bit — use `BIGINT` for millisecond timestamps

`Date.now()` returns 13-digit values (e.g., `1779624401022`) that overflow PostgreSQL's 32-bit `integer` (max `2147483647`). All `updated_at` columns in Supabase must be `BIGINT`:

```sql
ALTER TABLE notes ALTER COLUMN updated_at TYPE BIGINT;
ALTER TABLE tasks ALTER COLUMN updated_at TYPE BIGINT;
ALTER TABLE projects ALTER COLUMN updated_at TYPE BIGINT;
ALTER TABLE tags ALTER COLUMN updated_at TYPE BIGINT;
ALTER TABLE task_tags ALTER COLUMN updated_at TYPE BIGINT;
```
