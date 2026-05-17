You are an expert React Native and Expo engineer helping me build Ord.
Write clean, simple, maintainable code. Prioritize clarity over unnecessary abstraction.
Think like a senior mobile developer.

---

## Project Overview

We are building Ord, a mobile productivity / todo list app following the simplified GTD system.
The app includes:

- Capture: quickly store raw notes from the user
- Clarify: move notes into GTD categories (Inbox, Next Actions, Waiting For, Someday/Maybe, Reference) and assign optional projects
- Filter: filter tasks by category, project, or context
- Review: sort and review tasks (Weekly Review flow)
- Offline-first sync via PowerSync + Supabase

## Keep the implementation simple and readable.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Expo SQLite (local database)
- Drizzle ORM (schema + migrations)
- PowerSync (offline-first sync)
- Supabase (Postgres backend + Auth)

Do not introduce new major libraries unless there is a strong reason.
Ask before installing anything new.

---

## Development Philosophy

Build feature by feature.
For every feature:

1. Read this file first.
2. Keep the implementation simple.
3. Avoid overengineering.
4. Prefer readable code over clever code.
5. Build the smallest useful version first.
6. Refactor only when repetition appears.

---

## Decision Making

If something is unclear or could be improved, suggest a better approach. If a new library would significantly help, recommend it, explain why, and ask before adding it.
Do not install new libraries without approval.

---

## Architecture

Use this folder structure (all of those folders should be put inside src/):

```
app/
  (auth)/
  (tabs)/

components/

constants/

data/

db/
  schema.ts
  migrations/

hooks/

lib/
  supabase.ts
  powersync.ts

store/

types/

assets/
```

**app/** is for routes and screens only. Screens compose components and
call hooks or stores. They should not contain large reusable UI blocks
or business logic.

**components/** is for reusable UI. Create a component when it is
reused in multiple places, when it makes a screen easier to read, or
when it represents a clear UI concept. Examples for this app:
QuickNoteModal. Do not create components too early.

**data/** holds hardcoded content. Keep it typed.

**db/** holds the Drizzle schema and migration files. Schema changes
always go through a migration — never edit the DB directly.

**store/** holds Zustand stores. Do not persist auth state here; Supabase
handles session persistence.

**lib/** holds external service helpers. `supabase.ts` exports the
Supabase client. `powersync.ts` sets up the PowerSync connector.
Never expose secret keys here.

---

## UI Rules

Use SafeAreaView from react-native-safe-area-context for every screen, modal, and everywhere needed for safety

For any UI task:

- Replicate the provided design exactly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors, border radius, shadows, alignment, and proportions.
- Do not approximate. Do not simplify unless explicitly asked.

---

## Styling Rules

Use `StyleSheet.create` for all styles (should be defined outside components). Do not use NativeWind or className-based styling.
Avoid using borders as much as possible, instead use different surface colors and/or shadows.
Basic styles should be defined in `constants/theme.ts` and adapts to system theme. Avoid using custom styles in different files unless explicitly asked / necessary.

Refer to `constants/theme.ts` for colors, spacing, typography, border radii, and basic component styles.
Styles have to follow current system theme.
Do not hardcode values inline.
Use `constants/ThemeExampleStylesheet.tsx` as a reference if you need.

## Image Rule

Use centralized image imports.

1. Check if `constants/images.ts` exists.
2. If not, create it.
3. Import all app images there.
4. Use them through the centralized object.

```ts
import mascot from "@/assets/images/mascot.png";
export const images = {
  mascot,
};
```

```tsx
<Image source={images.mascot} />
```

## Do not import image assets directly inside screens or components.

## State Management

- Zustand for global client state (filters, review mode, UI state).
- Local state for temporary UI state (input values, modal visibility).
- Do not store auth session in Zustand — read it from Supabase directly.
- PowerSync handles task/note data reactively; prefer PowerSync hooks over manual Zustand caching for synced data.

---

## Database

- Schema lives in `db/schema.ts` using Drizzle ORM.
- Every schema change requires a new migration in `db/migrations/`.
- All tables must include a `user_id` column referencing the
  authenticated Supabase user.
- Use UUID primary keys.
- Never write raw SQL outside of `db/` or `lib/powersync.ts`.

```ts
// db/schema.ts example
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // inbox | next_action | waiting_for | someday | reference
  projectId: text("project_id"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
```

---

## TypeScript

- Strict mode.
- No `any`.
- Keep types simple and readable.
- Define shared types in `types/`. Do not define types inline in
  screens.

---

## Authentication

Use Supabase Auth. Do not build custom auth.

- The Supabase client lives in `lib/supabase.ts`.
- Use `supabase.auth.getSession()` to read the current session.
- Protect routes in `app/(auth)/` using Expo Router's layout guards.
- Never store the access token manually — Supabase handles refresh.

```ts
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Secrets

- Never expose secret keys in client code.
- Use `.env` with `@env` (react-native-dotenv) for Supabase URL and anon key only — these are safe to expose.
- Never put the Supabase service role key in client code.
- Any future server-side calls go through Supabase Edge Functions.

---

## Feature Implementation

When building a feature:

1. Read this file first.
2. Identify the files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Make sure the feature works end to end.
7. Fix lint and type errors before finishing.

---

## Communication

## Be concise. Explain what changed and how to test it.

## Final Reminder

Before every feature:

- Read this file.
- Follow it strictly.
- Build clean, simple code.
- Replicate UI exactly when designs are provided.
