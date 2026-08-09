# NounBound

**Every noun belongs somewhere. Find the connection.**

NounBound is a mobile word-connection puzzle game where players sort ambiguous nouns into hidden groups spanning celebrities, automotive culture, everyday items, history, and future themed worlds.

Its signature identity combines Category Collisions, Connection Chains, Journey Worlds, and Clever Connections.

## Current status

**Pre-production / Phase 1 documentation.** The next milestone is a playable offline prototype with a tutorial and 10 validated puzzles.

## MVP rules

- 16 shuffled noun cards
- 4 hidden groups of 4 nouns
- Select four cards and submit
- 3 incorrect submissions allowed
- Correct groups lock and reveal their connection
- Optional category naming awards bonus Insight Points
- Progressive hints and local offline progress
- No accounts, ads, or backend in the first prototype

## Documentation

- [Master Roadmap](docs/ROADMAP.md)
- [Game Design Bible](docs/bibles/GAME_DESIGN_BIBLE.md)
- [Puzzle Bible](docs/bibles/PUZZLE_BIBLE.md)
- [Content Bible](docs/bibles/CONTENT_BIBLE.md)
- [UI & Visual Bible](docs/bibles/UI_VISUAL_BIBLE.md)
- [Monetization Bible](docs/bibles/MONETIZATION_BIBLE.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Puzzle Schema](docs/PUZZLE_SCHEMA.md)
- [Testing Plan](docs/TESTING_PLAN.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Decision Log](docs/DECISIONS.md)

## Recommended technology

React Native, Expo, TypeScript, Expo Router, local persistence, Reanimated, and EAS Build. Optional online services are introduced only after the offline MVP proves enjoyable and stable.

## First implementation milestone

1. Initialize the Expo TypeScript app.
2. Add the schema, validator, and 10 reviewed puzzles.
3. Build the board, validation, mistakes, hints, and results.
4. Save progress locally.
5. Add tutorial and accessibility.
6. Test on iPhone and Android.
7. Decide whether the core loop is fun before adding accounts, ads, or live services.

## Repository description

A word-connection puzzle game about grouping nouns, uncovering hidden associations, and solving category collisions across themed worlds.
