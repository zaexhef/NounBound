# UI & Visual Bible

## Direction

A modern “living archive” aesthetic: warm museum lighting, tactile noun cards, subtle map restoration, and clean typography. Each world gets a distinct accent without changing core controls.

## World palette

- Celebrity Spotlight: plum and gold
- Motor City Garage: deep blue and signal red
- House of Objects: teal and amber
- History Vault: parchment, bronze, and charcoal

Exact color tokens must pass WCAG contrast checks before lock.

## Core screens

1. Splash/loading
2. Home
3. Journey map
4. Puzzle select
5. Puzzle board
6. Results/explanation
7. Collection/achievements
8. Settings/accessibility
9. Puzzle error/report form after online services exist

## Puzzle board hierarchy

- Top: world, puzzle title, progress
- Center: responsive 4×4 noun grid
- Below: mistakes and contextual message
- Bottom: Submit, Deselect, Hint
- Solved groups move into compact labeled bands in solve order

## Interaction

- Tap toggles selection.
- Selected cards use color, border, scale, and optional haptic—not color alone.
- Submit is disabled until exactly four cards are selected.
- Incorrect: brief shake with reduced-motion alternative.
- Correct: cards converge into a labeled group.
- Long press may reveal pronunciation/accessibility help, never a hidden solution.

## Accessibility

- Dynamic type and responsive card height
- Screen-reader label includes noun and selected state
- Logical focus order after groups lock
- Minimum 44×44 point touch targets
- High-contrast mode
- Reduced motion
- Sound and haptic toggles
- No information conveyed only through color or audio
- Plain-language hints and explanations

## Motion

Motion should clarify state:
- 120–180 ms selection
- 250–400 ms group lock
- Short journey restoration moment after results
- Never block input for decorative animation
- Reduced-motion mode replaces movement with fades/state changes

## Audio

Optional, restrained cues for selection, success, incorrect submission, world restoration, and chain transition. No persistent audio is required to play.

## Responsive rules

Test narrow phones, large phones, tablets, landscape interruption, large text, and long proper nouns. Text must wrap safely without shrinking below the readable minimum.
