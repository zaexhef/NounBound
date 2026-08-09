# Puzzle Schema

## Canonical shape

```ts
type Difficulty = "tutorial" | "easy" | "normal" | "hard" | "expert";
type ReviewStatus =
  | "draft"
  | "fact_checked"
  | "ambiguity_reviewed"
  | "playtested"
  | "approved"
  | "published"
  | "retired";

interface NounBoundPuzzle {
  schemaVersion: 1;
  id: string;
  contentVersion: number;
  title: string;
  world: "celebrity" | "automotive" | "objects" | "history" | "crossover";
  difficulty: Difficulty;
  mode: "classic" | "category_collision" | "context_shift";
  groups: Array<{
    id: string;
    connection: string;
    words: [string, string, string, string];
    explanation: string;
    hints: [string, string, string, string];
  }>;
  cleverConnections: Array<{
    words: [string, string, string, string];
    connection: string;
    note: string;
  }>;
  completionFact?: string;
  editorial: {
    status: ReviewStatus;
    author: string;
    factChecker?: string;
    ambiguityReviewer?: string;
    sourceNotes: string[];
    playtests: number;
  };
}
```

## Example draft

```json
{
  "schemaVersion": 1,
  "id": "crossover-001",
  "contentVersion": 1,
  "title": "Names in Motion",
  "world": "crossover",
  "difficulty": "normal",
  "mode": "category_collision",
  "groups": [
    {
      "id": "presidents",
      "connection": "Surnames of U.S. presidents",
      "words": ["Lincoln", "Ford", "Jackson", "Carter"],
      "explanation": "Each is the surname of a U.S. president.",
      "hints": ["Think government.", "Think United States.", "They held the same office.", "U.S. presidents"]
    },
    {
      "id": "vehicle-models",
      "connection": "Vehicle model names",
      "words": ["Mustang", "Camry", "Civic", "Wrangler"],
      "explanation": "Each is used as the name of a vehicle model.",
      "hints": ["Think transportation.", "They appear at dealerships.", "These are model names.", "Vehicle models"]
    },
    {
      "id": "planets",
      "connection": "Planets",
      "words": ["Mercury", "Venus", "Earth", "Mars"],
      "explanation": "Each is a planet in our solar system.",
      "hints": ["Look upward.", "Think astronomy.", "They orbit the Sun.", "Planets"]
    },
    {
      "id": "everyday-tools",
      "connection": "Hand tools",
      "words": ["Hammer", "Wrench", "Pliers", "Saw"],
      "explanation": "Each is a common hand tool.",
      "hints": ["Think repair.", "You may find them in a toolbox.", "They are used by hand.", "Hand tools"]
    }
  ],
  "cleverConnections": [],
  "completionFact": "Several words in this board can have meanings beyond their intended group.",
  "editorial": {
    "status": "draft",
    "author": "NounBound team",
    "sourceNotes": [],
    "playtests": 0
  }
}
```

This is deliberately a draft: “Ford” and “Mercury” must undergo an accidental-solution review before approval.

## Validator requirements

- Exactly four groups and four unique words per group
- 16 unique normalized visible words
- Unique stable IDs
- Nonempty labels, explanations, and four hints
- Allowed enum values only
- Approved puzzles require source notes where factual claims need verification
- Published content must previously be approved
