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
| Monetization timing | After core-loop validation |
| Public store submission | Requires explicit owner approval |

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
| Initial monetization | Ads, packs, cosmetics | Rewarded hints plus one-time ad removal after beta |

Record new decisions with date, owner, rationale, and affected documents.
