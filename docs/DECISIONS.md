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

## Resolved during implementation (2026-08-10)

| Decision | Choice | Rationale |
|---|---|---|
| Art direction | Living archive | Matches UI Visual Bible; implemented in `src/theme` |
| State library | Zustand | Shared board/progress/economy across Expo Router screens |
| MVP persistence | AsyncStorage + SQLite ledger | Progress/settings/board in AsyncStorage; economy ledger ready for SQLite |
| Category typing | Optional multiple choice foundation via `nameCategory` | Early builds keep naming optional |
| “One away” feedback | Through Normal; off on Expert | Matches Game Design Bible |
| Portrait/landscape | Portrait-first with safe rotation handling | Orientation portrait in Expo config |
| Accounts | None | Offline MVP; no account dependency |
| Daily streak | Forgiving with streak protections | Service failure does not destroy streak |
| Ad provider | Sandbox adapter default | Expo SDK 57 privacy/compatibility spike; production SDK pending owner approval |
| Purchase layer | Provider-neutral sandbox adapter | No store credentials in repo; restore/refund/duplicate covered in tests |
| Interstitial launch status | Disabled by default | Feature-flagged; never enabled in production config |
| App icon | Temporary Expo placeholders | Approved master not yet in repository; see `assets/ICON_STATUS.md` |

## Open decisions

| Decision | Options | Recommendation |
|---|---|---|
| Final title/legal availability | NounBound or alternate | Perform trademark/store/domain search before branding spend |
| Coin-pack final pricing | Platform tiers and regional prices | Calibrate after closed-beta economy testing |
| Production ad SDK | react-native-google-mobile-ads vs alternatives | Re-evaluate against pinned Expo SDK before enabling |
| Production IAP SDK | Expo IAP / react-native-iap | Wire only after App Store Connect products exist |
| Challenge pass | None, one-time season pass, recurring pass | Defer until post-launch evidence |
| Support URL / privacy URL | Owner-provided | Required before public App Review |
| EAS project ID / ASC App ID | Owner-provided | Required for signed TestFlight upload |

Record new decisions with date, owner, rationale, and affected documents.
