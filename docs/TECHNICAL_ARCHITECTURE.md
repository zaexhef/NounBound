# Technical Architecture

## Stack

- Expo + React Native + TypeScript
- Expo Router
- Zustand or reducer-based domain store
- AsyncStorage for simple MVP persistence
- SQLite when puzzle/content volume, transaction ledgers, or migrations justify it
- Reanimated for state-signaling motion
- Zod or JSON Schema for content and economy configuration validation
- Jest/Vitest-compatible logic tests and React Native Testing Library
- EAS Build for distribution

Ad and in-app-purchase providers are intentionally undecided until Phase 9, when current Expo compatibility, platform policy, consent needs, maintenance quality, and regional support can be evaluated.

## Boundaries

```
app/                    routes and screen composition
src/components/         reusable visual components
src/features/game/      board state, selection, validation, scoring
src/features/content/   puzzle loading and versioning
src/features/save/      persistence and migrations
src/features/economy/   coins, ledger, rewards, sinks, reconciliation
src/features/timers/    hint regeneration and optional timed benefits
src/features/ads/       placement policy, caps, callbacks, consent
src/features/purchases/ products, entitlements, restore, refunds
src/features/config/    feature flags and validated remote configuration
src/features/a11y/      accessibility helpers
src/data/               bundled approved puzzles and safe configurations
src/theme/              tokens and world themes
tests/                  unit, integration, content/economy validation
scripts/                editorial validators and export tools
```

UI components must not decide whether a group is correct, award currency, or grant an entitlement. Pure domain services validate an action and return deterministic state changes. Provider callbacks enter through adapters and are reconciled exactly once.

## Core game state

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

## Economy state after Phase 9

- earnedCoinBalance and purchasedCoinBalance
- transaction ledger with stable transaction IDs and reason codes
- hintTokenCount, hintTokenCapacity, nextHintAt
- active timed benefits with purpose, start, end, and status
- ad cooldowns, daily/session counts, and last placement timestamps
- ad-removal and premium-content entitlements
- pending ad rewards and purchase reconciliation records
- economyConfigVersion and feature-flag snapshot
- economy schema version

## Key actions

Game:
`startPuzzle`, `toggleCard`, `submitSelection`, `requestHint`, `nameCategory`, `resumePuzzle`, `resetPuzzle`.

Economy:
`awardCoins`, `spendCoins`, `claimTimedBenefit`, `skipTimer`, `regenerateHint`, `offerRewardedAd`, `reconcileAdReward`, `reconcilePurchase`, `restoreEntitlements`.

Every award, spend, ad reward, and purchase uses a stable idempotency key. Duplicate callbacks return the previously recorded result.

## Persistence and migration

- Save after every meaningful action.
- Use atomic writes where available.
- Store schema versions and migrate forward.
- Keep completed history separate from active board state.
- Preserve pre-economy saves with zero-cost migration defaults.
- Persist absolute timer endpoints plus monotonic/session evidence where available.
- Treat large backward clock changes as a reconciliation case, not automatic player punishment.
- Keep a durable pending-operation record before beginning provider transactions.
- Never overwrite newer remote state with an older local save if sync is added.
- Move the transaction ledger to SQLite or a trusted service before production if AsyncStorage cannot meet durability and query requirements.

## Currency transaction rules

A currency operation contains:

- transactionId
- player/economy identity
- source or sink reason
- earned amount delta
- purchased amount delta
- resulting balance
- related puzzle, timer, ad, or store transaction ID
- created timestamp
- configuration version

Spending checks the authoritative available balance and commits the ledger record and balance atomically. Earned currency is spent before purchased currency unless platform or legal requirements require another policy.

## Timer rules

- The main journey never uses an energy timer.
- Timers represent optional benefits.
- The UI derives remaining time from an end timestamp rather than decrementing stored seconds.
- App resume recalculates eligibility.
- Once online services exist, valuable timer skips and paid states reconcile against trusted time.
- Offline failure or unavailable ads always preserve the normal wait path.

## Ads and purchases

Provider SDKs are wrapped behind interfaces so test doubles can simulate availability, cancellation, failure, completion, duplicate callbacks, and delayed callbacks.

Ad placement policy is separate from the provider:

- eligibility
- consent and age restrictions
- session/daily caps
- cooldown
- natural-break placement
- ad-removal entitlement
- rewarded versus forced placement

Purchase handling must support:

- product loading and localized price display
- consumable coin packs
- non-consumable ad removal
- pending and interrupted transactions
- verification and reconciliation
- restore for restorable entitlements
- refunds and revoked entitlements
- duplicate transaction callbacks

Never place store secrets in the client or repository.

## Content and configuration loading

MVP ships approved content in the bundle. Later remote content and economy configuration are:

1. downloaded,
2. signature/version checked,
3. schema validated,
4. range and invariant checked,
5. stored beside the prior known-good version,
6. activated atomically,
7. rolled back on failure.

Required invariants include nonnegative rewards/prices, bounded frequency caps, a free timer path, and no energy requirement for core play.

## Privacy and security

- Collect no personal data in MVP unless a chosen service requires it and disclosures are updated.
- No secrets in the client or repository.
- Minimize permissions.
- Validate all remote content and configuration as untrusted input.
- Rate-limit user submission and economy endpoints.
- Use stable anonymous IDs only if analytics is approved.
- Gate ad personalization and tracking behind applicable consent.
- Maintain accurate privacy labels, data-safety forms, age ratings, and ad disclosures.

## Testing

In addition to game tests:

- Property-test that balances never become negative.
- Verify concurrent spends cannot exceed the balance.
- Verify duplicate callbacks are idempotent.
- Test timer behavior across restart, offline use, timezone changes, and clock changes.
- Test ad unavailable/cancelled/failed/completed states.
- Test purchase success/cancelled/pending/refunded/restored states.
- Test ad-removal placement suppression.
- Test configuration rollback and bundled fallback.
- Test migration from every released save schema.
- Test screen-reader announcements for countdowns, prices, errors, and confirmations.

## Performance budgets

Set measured budgets during prototype:

- Interactive launch on representative low-end device
- Selection feedback perceived immediately
- Board shuffle/validation without dropped frames
- No network on the critical path for bundled puzzles
- Images/audio compressed and lazy-loaded
- Ad and purchase SDKs do not materially harm launch time
- Economy persistence does not block card interaction

## Environments

Development, preview/beta, and production use separate configuration and provider identifiers. Feature flags independently control remote content, analytics, rewarded ads, interstitials, coin purchases, ad removal, and each timer type.

Production monetization remains disabled until the release gate and explicit owner approval pass.
