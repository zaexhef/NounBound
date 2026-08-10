# NounBound

**Every noun belongs somewhere. Find the connection.**

NounBound is a premium-feeling mobile word-connection puzzle journey. Players inspect 16 shuffled noun cards and divide them into four intended groups of four. Signature systems include Category Collision, Connection Chains, Journey Worlds, and Clever Connections.

## Current status

**Implementation branch in progress** — Expo SDK 57 / React Native 0.86 TypeScript app with offline MVP, signature features, progression, and feature-flagged economy/ads/purchase architecture.

Prototype puzzles use honest editorial statuses (`draft` / `ambiguity_reviewed`). They are **not** marked approved or playtested.

## Stack

- Expo + React Native + TypeScript (strict)
- Expo Router
- Zustand
- AsyncStorage + SQLite ledger
- Zod content/config validation
- Reanimated, Expo Haptics/AV
- Jest + React Native Testing Library
- EAS Build / Submit

## Scripts

```bash
npm start
npm test
npm run typecheck
npm run lint
npm run validate:puzzles
npm run doctor
```

## Documentation

- [Master Roadmap](docs/ROADMAP.md)
- [Game Design Bible](docs/bibles/GAME_DESIGN_BIBLE.md)
- [Puzzle Bible](docs/bibles/PUZZLE_BIBLE.md)
- [Content Bible](docs/bibles/CONTENT_BIBLE.md)
- [UI & Visual Bible](docs/bibles/UI_VISUAL_BIBLE.md)
- [Monetization Bible](docs/bibles/MONETIZATION_BIBLE.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Puzzle Schema](docs/PUZZLE_SCHEMA.md)
- [Content Editor](docs/CONTENT_EDITOR.md)
- [Testing Plan](docs/TESTING_PLAN.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Decision Log](docs/DECISIONS.md)

## Architecture boundaries

See `docs/TECHNICAL_ARCHITECTURE.md`. UI never independently decides correctness, currency grants, or entitlements.

## Monetization posture

Economy, rewarded ads, interstitials, and purchases are implemented behind feature flags and sandbox adapters. Production monetization stays disabled until explicit owner approval. No public App Review is started by automation.
