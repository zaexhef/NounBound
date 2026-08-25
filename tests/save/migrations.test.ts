import {
  createDefaultProgress,
  migrateBoardState,
  migrateProgress,
} from "../../src/features/save/persistence";
import { createBoardState } from "../../src/features/game/engine";
import { getPuzzleById } from "../../src/features/content/loader";

describe("persistence migrations", () => {
  it("migrates missing v1 progress fields forward", () => {
    const migrated = migrateProgress({
      schemaVersion: 1,
      onboardingComplete: true,
      insightPoints: 100,
      stats: { solves: 2 },
    });
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.stats.streakProtections).toBe(1);
    expect(migrated.cosmetics.equippedCardBack).toBe("archive_default");
    expect(migrated.insightPoints).toBe(100);
  });

  it("resumes active board state shape", () => {
    const puzzle = getPuzzleById("easy-001")!;
    const board = createBoardState(puzzle, { random: () => 0.2 });
    const resumed = migrateBoardState(JSON.parse(JSON.stringify(board)));
    expect(resumed?.puzzleId).toBe("easy-001");
    expect(resumed?.shuffledWords).toHaveLength(16);
  });

  it("defaults progress safely", () => {
    expect(createDefaultProgress().completedPuzzleIds).toEqual([]);
  });
});
