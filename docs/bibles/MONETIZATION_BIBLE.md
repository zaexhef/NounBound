# Monetization Bible

## Principle

NounBound earns through convenience, optional rewards, and expression—never by making a puzzle unfair or withholding a required answer.

The main journey and Classic puzzles remain continuously playable. Timers apply only to optional benefits such as hint regeneration, bonus chests, second chances, challenge unlocks, and Journey World exhibit restoration.

## Monetization launch sequence

1. Release the MVP and early beta without monetization.
2. Validate puzzle fairness, retention, and hint demand.
3. Add the economy behind feature flags in test builds.
4. Add optional rewarded ads.
5. Add one-time forced-ad removal and coin packs.
6. Consider premium puzzle packs and cosmetics only after the editorial pipeline proves sustainable.

All values below are starting balance targets and must be adjusted using closed-beta data.

## Currency: Noun Coins

Noun Coins are a soft currency earned through play, optional rewarded ads, and in-app purchases.

Players can earn coins by:

- Completing puzzles
- Solving without mistakes or hints
- Completing daily and weekly challenges
- Reaching achievement milestones
- Maintaining forgiving login streaks
- Finishing a themed Journey World
- Watching an optional rewarded ad
- Purchasing a disclosed coin pack

Purchased coins never expire. The game must display the balance and exact price before every spend.

### Starting reward values

| Player action | Coins |
|---|---:|
| Complete an Easy puzzle | 10 |
| Complete a Normal puzzle | 15 |
| Complete a Hard puzzle | 25 |
| Complete an Expert puzzle | 40 |
| Perfect solution bonus | 10 |
| First puzzle of the day | 20 |
| Daily challenge | 50 |
| Seven-day streak | 150 |
| Optional rewarded ad | 20–30 |
| Complete a themed world | 250 |

Rewards must allow an active free player to use hints regularly without buying coins.

## Hint tokens

Players can hold up to three free hint tokens. A token may:

- Reveal the broad category
- Lock one correct noun
- Remove one incorrect noun
- Explain one selected noun
- Restore one incorrect attempt

One token regenerates every 15 minutes until the free-token capacity is full. When empty, the player may wait, spend coins, or watch a rewarded ad. A lack of ad inventory must never block the free timer.

## Timed optional features

| Optional feature | Starting timer | Coin shortcut |
|---|---:|---:|
| One free hint token | 15 minutes | 20 coins |
| Daily bonus chest | 4 hours | 60 coins |
| Second-chance token | 30 minutes | 35 coins |
| Challenge pack unlock | 2 hours | 100 coins |
| Exhibit restoration | 1–6 hours | Scales with duration |

Rules:

- Show the exact remaining time.
- Timers continue while the app is closed.
- Spending coins or watching an ad is optional.
- The player always retains access to meaningful free puzzles.
- Server-validated time is preferred once online services exist; offline builds use tamper-aware timestamps without punishing legitimate clock changes.
- Never use fake urgency or threaten loss of earned progress.

## Rewarded ads

Every rewarded placement is player-initiated and states the reward before playback.

Approved rewards:

- Gain 20–30 coins
- Regenerate one hint token
- Remove or reduce a displayed timer
- Double the current puzzle-completion coin reward
- Open an eligible daily bonus chest
- Restore one incorrect attempt before the board ends

Rules:

- Grant a reward only after a verified completion callback.
- Make callbacks idempotent so a retry cannot duplicate or erase a reward.
- If the ad fails after starting, preserve the player's state and offer retry or the normal free path.
- Never place a rewarded ad immediately after an interstitial.
- Apply daily and session frequency caps.
- Respect consent, age, platform, and regional requirements.

## Interstitial ads

Interstitials are optional for the product plan and must be tested separately from rewarded ads.

If enabled:

- Show at most after every 4–6 completed puzzles.
- Show only at a natural transition after the results screen.
- Never show during a puzzle, after an incorrect answer, before results, on app launch, or immediately after a rewarded ad.
- Never show to players who own forced-ad removal.
- Apply session, cooldown, and daily caps.
- Disable them if retention, completion, or reviews materially worsen.

“Ad removal” removes forced interstitial/banner advertising. It does not remove player-selected rewarded ads, because those exchange an ad view for an explicit reward.

## Coin packs and premium products

Provisional examples; final products must use Apple and Google price tiers and local pricing.

| Product | Coins | Example price |
|---|---:|---:|
| Pocket of Coins | 250 | $0.99 |
| Coin Pouch | 700 | $2.99 |
| Coin Case | 1,500 | $4.99 |
| Coin Vault | 3,500 | $9.99 |
| Collector Vault | 8,000 | $19.99 |

Additional approved products:

- Permanent forced-ad removal: target $2.99–$4.99
- Starter bundle: ad removal, disclosed coins, and an exclusive cosmetic
- Premium themed puzzle packs
- Cosmetic card backs and board themes
- Optional challenge pass only after launch evaluation

Do not launch with a subscription unless a later owner-approved plan demonstrates recurring value.

## Economy protections

- Never allow a negative balance.
- Confirm expensive spends and all real-money purchases.
- Separate earned and purchased coin amounts internally for accounting, refund, and legal requirements while showing a clear usable total.
- Apply earned coins before purchased coins unless platform/legal requirements dictate otherwise.
- Keep a transaction ledger with stable IDs, reason codes, timestamps, amount, and resulting balance.
- Make every purchase, ad reward, and timer skip idempotent.
- Restore non-consumable purchases and entitlements.
- Reconcile consumable purchases safely after network interruption.
- Handle refunds and revoked entitlements.
- Do not sell random rewards or use gambling-like presentation.
- Provide parental purchase controls and accurate age-rating disclosures.
- Never change a displayed price between confirmation and execution.

## Prohibited patterns

- Energy required to play the main journey
- Loot boxes or paid random rewards
- Paying to correct an invalid puzzle
- Forced ads after every board
- Hiding the only solution behind payment
- Fake countdowns, misleading buttons, or accidental purchases
- Competitive power or score multipliers sold for money
- Removing earned progress when a timer expires
- Making a failed ad the player's only route forward

## Required technical state

- Earned coin balance
- Purchased coin balance
- Transaction ledger
- Hint-token count, capacity, and next regeneration timestamp
- Active timers with purpose, start, end, and completion state
- Ad placement cooldowns and frequency counters
- Ad-removal and premium entitlements
- Pending purchase/ad reward reconciliation records
- Economy configuration version
- Feature flags and regional eligibility

Economy values must be remotely configurable only through a validated, versioned configuration with a bundled safe fallback. Never trust the client alone for paid entitlements once online services are enabled.

## Test plan

Test at minimum:

- Earn, spend, insufficient balance, and concurrent spend
- App close/reopen during every timer
- Device clock and timezone changes
- Offline start and reconnection
- Ad unavailable, cancelled, failed, completed, and duplicate callback
- Purchase success, cancellation, pending, duplicate callback, refund, and restore
- Ad-removal behavior across reinstall and supported devices
- Migration from a pre-economy save
- Accessibility of countdowns, disclosures, and confirmation dialogs
- Regional consent and age-restricted configurations

## Metrics and guardrails

Track only privacy-approved events:

- Coins earned and spent by source/sink
- Hint inventory and regeneration
- Rewarded-ad offers, starts, completions, and failures
- Interstitial frequency and exits
- Purchase funnel and restore success
- Puzzle completion, hint dependence, return rate, and session length

Pause or reduce monetization when it increases exits, lowers puzzle completion, creates abnormal hint dependence, or generates complaints about pressure or confusion. Revenue never overrides puzzle fairness.
