# NounBound Master Roadmap

This roadmap converts the concept into a production-ready mobile game. A phase is complete only when its exit gate passes.

## Phase 1 — Product definition

**Goal:** Lock the identity and rules before coding.

Deliverables:
- Game, Puzzle, Content, UI/Visual, and Monetization Bibles
- Audience: casual puzzle fans, teens and adults, trivia and word-game players
- Signature pillars: Category Collision, Connection Chains, Journey Worlds
- MVP rules and success metrics
- Decision log for unresolved choices

Exit gate:
- A new team member can explain the core loop, audience, uniqueness, and MVP without guessing.
- Ten candidate puzzles follow the Puzzle Bible.

## Phase 2 — Core rules and paper prototype

**Goal:** Prove the puzzle works without relying on visual polish.

Deliverables:
- 16 cards, four groups of four, three mistakes
- Selection, submission, solve, loss, reset, and hint rules
- Category-name bonus rule
- Paper/spreadsheet tests with at least five people
- Difficulty rubric and frustration notes

Exit gate:
- At least 80% of tutorial testers finish without outside explanation.
- Testers can state why each answer is correct.
- No puzzle has an unintended solution that prevents completion.

## Phase 3 — Puzzle database

**Goal:** Establish a safe, scalable content pipeline.

Deliverables:
- Canonical JSON/TypeScript schema
- Stable IDs and content versioning
- Editorial workflow: draft → fact-check → ambiguity review → playtest → approved
- 10 prototype puzzles; 85 launch-target puzzles
- Duplicate noun, duplicate group, and accidental-solution checks

Launch content target:

| Type | Count |
|---|---:|
| Tutorial | 5 |
| Easy | 20 |
| Normal | 30 |
| Hard | 20 |
| Expert | 10 |
| Total | 85 |

Exit gate:
- Every prototype puzzle passes schema validation and two-person editorial review.
- Facts and spellings have recorded sources in editorial notes.

## Phase 4 — Playable MVP

**Goal:** Build a polished, offline vertical slice.

Deliverables:
- Expo/TypeScript project
- Home, puzzle select, board, result, settings, and tutorial screens
- Card selection, shuffling, validation, mistakes, hints, scoring
- Local saves, resume behavior, sound/haptic toggles
- 10 approved puzzles and basic accessibility

Explicitly excluded:
- Accounts, multiplayer, ads, purchases, backend, daily live content, user submissions

Exit gate:
- Full tutorial-to-results path works offline after a cold launch.
- Progress survives restart.
- Automated tests cover validation and save migration.
- No blocker or critical issue remains.

## Phase 5 — Signature features

**Goal:** Make NounBound recognizably different.

Deliverables:
- Category Collision puzzle labels and presentation
- Connection Chain transitions between selected puzzles
- Journey Map with four initial worlds
- Clever Connection submission capture for future review
- Context Shift and Deceptive Noun challenge variants

Exit gate:
- Players can identify at least one signature mechanic without prompting.
- Alternate-connection capture cannot incorrectly complete or corrupt a puzzle.

## Phase 6 — Progression and retention

**Goal:** Reward mastery without harming puzzle fairness.

Deliverables:
- Insight Points and three-star scoring
- Player level, achievements, world completion rewards
- Daily puzzle architecture and streak with forgiving recovery rules
- Cosmetic card backs, board themes, profile titles
- Statistics: solves, accuracy, hints, perfect boards, longest chain

Exit gate:
- Rewards never reveal paid competitive advantages.
- Save upgrades preserve earlier progress.
- Streak design does not punish a missed day excessively.

## Phase 7 — Online services and content tools

**Goal:** Support fresh content safely after the offline game is stable.

Deliverables:
- Puzzle editor with preview and validation
- Approved-content export
- Optional online service for daily puzzles, economy configuration, and content updates
- Cached offline fallback and content/configuration version rollback
- Minimal accounts only if cross-device sync is approved

Exit gate:
- The game remains playable when offline or the service is unavailable.
- Unapproved puzzles cannot reach players.
- Secrets are excluded from the client and repository.

## Phase 8 — Quality, accessibility, and security

**Goal:** Reach release-candidate quality.

Deliverables:
- Unit, integration, device, accessibility, and editorial test suites
- Dynamic text, screen-reader labels, contrast, reduced motion
- Crash/error reporting and privacy-conscious analytics
- Dependency, secret, and permission review
- Performance budgets for launch, board interaction, memory, and package size

Exit gate:
- Zero known critical/high-severity defects.
- All launch puzzles pass final editorial checks.
- Required disclosures match actual data behavior.

## Phase 9 — Ads, coins, timers, and purchases

**Goal:** Add optional revenue and convenience without manufacturing frustration or blocking the main journey.

Deliverables:
- Noun Coin earning, spending, balance display, and auditable transaction ledger
- Three-token hint inventory with one token regenerating every 15 minutes
- Optional timers for bonus chests, second chances, challenge packs, and exhibit restoration
- Coin shortcuts and rewarded-ad alternatives for eligible timers
- Optional rewarded ads for disclosed coins, hints, timer reduction, doubled rewards, chests, or attempt recovery
- Carefully capped interstitial experiment after every 4–6 completed puzzles at natural transitions only
- Permanent forced-ad removal
- Provisional coin packs, optional starter bundle, themed packs, and cosmetics
- Separate earned/purchased currency accounting
- Purchase restore, refund, pending transaction, duplicate callback, and failure handling
- Child/family, consent, platform, and regional compliance review
- Feature flags, economy configuration versioning, and bundled safe defaults
- Migration from all pre-economy saves
- Economy analytics with privacy and retention guardrails

Exit gate:
- Every core puzzle and the main journey remain continuously playable for free.
- All coin awards, spends, ad rewards, timer skips, and purchase callbacks are idempotent.
- Timers recover correctly after restart, offline use, timezone change, and reasonable clock changes.
- Purchased entitlements restore correctly on supported devices.
- No unavailable or failed ad blocks progression.
- Consent, age, purchase, ad, privacy, and store disclosures are verified on real devices.
- Closed-beta evidence shows monetization does not materially harm completion, retention, or perceived fairness.

## Phase 10 — Closed beta

**Goal:** Validate the full product with real players.

Deliverables:
- TestFlight and Google Play closed testing
- Feedback form and issue triage
- Funnel metrics: tutorial completion, puzzle completion, hint use, economy use, ad outcomes, and return rate
- Difficulty and economy calibration
- Device compatibility matrix

Exit gate:
- Tutorial completion ≥80%.
- Crash-free sessions meet the chosen launch threshold.
- Economy sources and sinks stay within approved balance ranges.
- No launch blocker remains; confusing puzzles are revised or removed.

## Phase 11 — Store and launch preparation

**Goal:** Produce an honest, review-ready release.

Deliverables:
- Final name availability check, icon, screenshots, preview copy
- Privacy policy and support page/email
- Age rating, data safety/privacy labels, ad declarations, and in-app purchase metadata
- Release notes, rollback plan, support response templates
- Unique build numbers and signed production builds

Exit gate:
- Store metadata matches the app.
- Release checklist is signed off.
- TestFlight/closed-track candidate passes all gates.

## Phase 12 — Launch and live operations

**Goal:** Release carefully and improve based on evidence.

Deliverables:
- Staged rollout
- Crash, review, support, puzzle-quality, economy, and ad monitoring
- Content calendar and monthly puzzle packs
- Economy adjustment and rollback procedure
- Hotfix process and content rollback
- Post-launch review at 24 hours, 7 days, and 30 days

Exit gate:
- Launch health is stable, or rollout is paused/rolled back.
- The next content release is approved and scheduled.

## Recommended execution order now

1. Resolve open decisions in `DECISIONS.md`.
2. Initialize Expo.
3. Implement the schema and validator.
4. Author and review 10 puzzles.
5. Build Phase 4 only.
6. Playtest before starting signature features.
7. Implement Phase 9 only after core-loop and retention validation.
