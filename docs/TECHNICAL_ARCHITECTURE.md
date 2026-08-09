# Technical Architecture

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Zustand or reducer-based domain store
- AsyncStorage for simple MVP persistence
- SQLite when puzzle/content volume or migrations justify it
- Reanimated for state-signaling motion
- Zod or JSON Schema for content validation
- Jest/Vitest-compatible logic tests and React Native Testing Library
- EAS Build for distribution

## Boundaries

```
app/                 routes and screen composition
src/components/      reusable visual components
src/features/game/   board state, selection, validation, scoring
src/features/content puzzle loading and versioning
src/features/save/   persistence and migrations
src/features/a11y/   accessibility helpers
src/data/            bundled approved puzzles
src/theme/           tokens and world themes
tests/               unit, integration, content validation
scripts/             editorial validators and export tools
```

UI components must not decide whether a group is correct. The pure game engine receives puzzle data and actions, then returns deterministic state.

## Core state

- puzzleId and contentVersion
- shuffledCardIds
- selectedCardIds
- solvedGroupIds
- mistakesRemaining
- hintStageByGroup
- score
- startedAt and elapsedMs
- status: playing, won, lost
- schemaVersion

## Key actions

`startPuzzle`, `toggleCard`, `submitSelection`, `requestHint`, `nameCategory`, `resumePuzzle`, `resetPuzzle`.

## Persistence

- Save after every meaningful action.
- Use atomic writes where available.
- Store schema version and migrate forward.
- Keep completed history separate from active board state.
- Never overwrite newer remote state with an older local save if sync is added.

## Content loading

MVP ships approved content in the bundle. Later remote content is:
1. downloaded,
2. signature/version checked,
3. schema validated,
4. stored beside the prior known-good version,
5. activated atomically,
6. rolled back on failure.

## Privacy and security

- Collect no personal data in MVP unless a chosen service requires it and disclosures are updated.
- No secrets in the client or repository.
- Minimize permissions.
- Validate all remote content as untrusted input.
- Rate-limit user submission endpoints.
- Use stable anonymous IDs only if analytics is approved.

## Performance budgets

Set measured budgets during prototype:
- Interactive launch on representative low-end device
- Selection feedback perceived immediately
- Board shuffle/validation without dropped frames
- No network on the critical path for bundled puzzles
- Images/audio compressed and lazy-loaded

## Environments

Development, preview/beta, and production must use separate configuration. Feature flags control online content, analytics, ads, and purchases.
