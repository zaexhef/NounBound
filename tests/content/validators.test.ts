import { bundledPuzzles } from "../../src/data/puzzles";
import {
  assertProductionEligible,
  validatePuzzle,
  validatePuzzleCollection,
} from "../../src/features/content/validators";
import { NounBoundPuzzle } from "../../src/features/content/schema";

describe("content validation", () => {
  it("validates all bundled puzzles for schema and uniqueness", () => {
    const issues = validatePuzzleCollection(bundledPuzzles);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
    expect(bundledPuzzles).toHaveLength(10);
  });

  it("requires exactly 16 unique nouns and four non-overlapping groups", () => {
    for (const puzzle of bundledPuzzles) {
      const words = puzzle.groups.flatMap((g) => g.words);
      expect(words).toHaveLength(16);
      expect(new Set(words).size).toBe(16);
    }
  });

  it("keeps stable unique IDs", () => {
    const ids = bundledPuzzles.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not falsely mark prototype puzzles as approved/published", () => {
    for (const puzzle of bundledPuzzles) {
      expect(["approved", "published", "playtested"]).not.toContain(
        puzzle.editorial.status,
      );
    }
  });

  it("blocks unapproved content from production inclusion", () => {
    const issues = assertProductionEligible(bundledPuzzles);
    expect(issues.some((i) => i.code === "UNAPPROVED_PRODUCTION_CONTENT")).toBe(true);
  });

  it("flags duplicate normalized nouns", () => {
    const bad: NounBoundPuzzle = {
      ...bundledPuzzles[0]!,
      id: "bad-dup",
      groups: [
        {
          ...bundledPuzzles[0]!.groups[0]!,
          words: ["Apple", "Banana", "Orange", "Grape"],
        },
        {
          ...bundledPuzzles[0]!.groups[1]!,
          words: ["apple", "Blue", "Green", "Yellow"],
        },
        bundledPuzzles[0]!.groups[2]!,
        bundledPuzzles[0]!.groups[3]!,
      ],
    };
    const issues = validatePuzzle(bad);
    expect(issues.some((i) => i.code === "NORMALIZED_DUPLICATE" || i.code === "DUPLICATE_NOUN")).toBe(
      true,
    );
  });
});
