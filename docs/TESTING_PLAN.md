# Testing Plan

## Test layers

### Pure game engine
- Selecting and deselecting cards
- Maximum four selected
- Correct group detection independent of card order
- Incorrect attempt decrement
- One-away feedback
- Win/loss transitions
- Hint progression and score effects
- Deterministic resume from saved state

### Content validation
- Schema and enum validity
- Exactly 16 unique nouns
- Four non-overlapping groups
- Duplicate puzzle/group detection
- Normalized spelling collisions
- Approved status requirements
- Content version monotonicity

### Screen integration
- Board renders from data
- Controls enable at correct times
- Locked groups leave the active grid
- Results match score breakdown
- Relaunch restores progress
- Settings apply immediately

### Device and accessibility
- Small/large iPhone and representative Android
- Tablet
- Large text and screen readers
- Reduced motion and high contrast
- Airplane mode, slow network, interruption, rotation
- Low memory and cold launch

### Online and commerce, when added
- Offline fallback
- Corrupt/expired remote content rollback
- Account/session failures
- Ad unavailable/abandoned/completed
- Purchase success, restore, refund, duplicate callback

## Editorial QA

Each puzzle receives blind playtests and records:
- completion rate
- solve time
- mistakes
- hint stages
- abandoned state
- guessed unintended groups
- fairness rating and free-text notes

## Severity

- **Blocker:** cannot launch, data loss, purchase/privacy failure, impossible widespread puzzle
- **Critical:** core loop broken, save corruption, inaccessible primary control
- **Major:** confusing content, wrong score, significant layout problem
- **Minor:** polish, copy, non-blocking visual defect

Release requires zero known blocker or critical issues.

## MVP acceptance scenarios

1. New player completes tutorial offline.
2. Player solves all groups in any valid order.
3. Three wrong guesses reveal loss and correct solution.
4. Player closes midway and resumes exact state.
5. Updating bundled content does not corrupt a saved board.
6. Screen-reader player can understand selection, mistakes, and solved groups.
7. Long nouns and large text remain usable.
