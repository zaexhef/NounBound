# Decision Log

## Locked

| Decision | Choice |
|---|---|
| Working title | NounBound |
| Platforms | iOS and Android |
| Framework | React Native with Expo and TypeScript |
| MVP board | 16 nouns; four groups of four |
| Mistakes | Three |
| Core launch domains | Celebrities, automotive, everyday items, history |
| MVP storage | Local/offline |
| Signature mechanics | Category Collision, Connection Chains, Journey Worlds |
| Puzzle label entry | Optional bonus, not required in Classic |
| MVP scope | Tutorial plus 10 approved puzzles |
| Monetization timing | After core-loop validation; excluded from MVP |
| Soft currency | Noun Coins |
| Main-journey access | Continuously playable without energy or timers |
| Hint capacity | Three free tokens |
| Hint regeneration | One token every 15 minutes |
| Timer scope | Optional benefits only; wait, coins, or eligible rewarded ad |
| Rewarded ads | Player-initiated with exact reward disclosed |
| Interstitial placement | Optional experiment after 4–6 completed puzzles; never during reasoning |
| Forced-ad removal | Permanent non-consumable purchase |
| Subscription | None at launch |
| Public store submission | Requires explicit owner approval |

## Provisional economy values

These are balance-test inputs, not permanent prices.

| Item | Starting value |
|---|---:|
| Easy completion | 10 coins |
| Normal completion | 15 coins |
| Hard completion | 25 coins |
| Expert completion | 40 coins |
| Perfect bonus | 10 coins |
| First puzzle of day | 20 coins |
| Daily challenge | 50 coins |
| Seven-day streak | 150 coins |
| Themed-world completion | 250 coins |
| Rewarded ad | 20–30 coins |
| Hint regeneration skip | 20 coins |
| Daily chest skip | 60 coins |
| Second-chance skip | 35 coins |
| Challenge-pack skip | 100 coins |

## Open decisions

| Decision | Options | Recommendation |
|---|---|---|
| Final title/legal availability | NounBound or alternate | Perform trademark/store/domain search before branding spend |
| Art direction | Living archive, neon circuit, minimalist paper | Living archive |
| State library | Zustand or reducer-only | Zustand if multiple screens share state |
| MVP persistence | AsyncStorage or SQLite | AsyncStorage for 10 puzzles |
| Category typing | Free text, multiple choice, none | Optional multiple choice in early builds |
| “One away” feedback | Always, limited, off on Expert | Always through Normal; off on Expert |
| Portrait/landscape | Portrait only or both | Portrait-first MVP |
| Accounts | None, optional sync | None until retention proves need |
| Daily streak | Strict or forgiving | Forgiving streak protection |
| Ad provider | Platform-supported provider options | Choose during Phase 9 after current SDK/privacy review |
| Purchase layer | Direct store SDK or maintained abstraction | Decide during Phase 9 technical spike |
| Coin-pack final pricing | Platform tiers and regional prices | Calibrate after closed-beta economy testing |
| Interstitial launch status | Disabled, limited rollout, enabled | Disabled by default; feature-flagged test only |
| Challenge pass | None, one-time season pass, recurring pass | Defer until post-launch evidence |

Record new decisions with date, owner, rationale, and affected documents.
