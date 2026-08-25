# Content editor foundation

NounBound ships a code-side content pipeline so puzzles can be added, previewed, validated, exported, versioned, and retired without editing gameplay code.

## Workflow

1. Author a puzzle object matching `src/features/content/schema.ts`.
2. Place it in `src/data/puzzles.ts` (or a future pack JSON imported by the loader).
3. Run `npm run validate:puzzles`.
4. Fix schema, duplicate, overlap, and ambiguity warnings.
5. Advance editorial status only with honest evidence:
   `draft → fact_checked → ambiguity_reviewed → playtested → approved → published`
6. Production packaging must call `assertProductionEligible` and fail closed on unapproved content.
7. Retire by setting `editorial.status` to `retired` and bumping `contentVersion` when replacing.

## Preview

- Use the in-app Puzzle selection screen (`/worlds`) to open any non-retired bundled puzzle.
- Diagnostics (`/diagnostics`, development only) reports validation issue counts.

## Export / versioning

- Stable `id` values never change meaning.
- `contentVersion` increments on material edits.
- Active saved boards keep their original `contentVersion` and are never invalidated by content updates.
- Future remote packs follow: download → verify → validate → range-check → store beside prior → activate atomically → rollback on failure.

## Internal editor next step

A dedicated visual editor UI can wrap the same Zod schema and validators. Until then, TypeScript puzzle modules plus `scripts/validate-puzzles.ts` are the supported editorial tools.
