# Decisions

## db-test Screen

The `app/(tabs)/db-test.tsx` screen is a development/testing utility screen only. It is not part of the production UI. Issues reported for this screen (e.g., touch target sizes, button styling) should be ignored unless they cause actual crashes or data loss.

## Touch Targets

Throughout the project, to ensure touch targets meet the 48x48 dp accessibility minimum, use `hitSlop` on Pressable components (e.g., `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`). Do not use `minWidth` or `minHeight` styles for this purpose — hitSlop is sufficient and avoids unnecessarily enlarging the visible UI.

## Tasks Screen Focus Handler — Preserve Reset-on-Return Behavior

In `src/app/(tabs)/tasks.tsx`, the `useFocusEffect` block resets local filters and search query to defaults when the tab regains focus and no `pendingFilters` handoff is set. An AI flag suggested removing the `else` branch to preserve state across refocuses. This was rejected: resetting filters and search on normal tab return is the intended behavior. The current implementation is correct and should not be changed.

## Padding bottom to avoid tab bar

Every screen must have some kind of spacing.tabBar at the bottom to avoid the tab bar
