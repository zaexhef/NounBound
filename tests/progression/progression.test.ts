import {
  applyForgivingStreak,
  applyPuzzleCompletion,
  completeJourneyNode,
  dayKey,
} from "../../src/features/progression/service";
import { createDefaultProgress } from "../../src/features/save/persistence";
import { createBoardState, submitSelection } from "../../src/features/game/engine";
import { getPuzzleById } from "../../src/features/content/loader";

describe("progression", () => {
  it("uses local day keys consistently for streaks", () => {
    const now = new Date(2026, 7, 10, 23, 0, 0);
    expect(dayKey(now)).toBe("2026-08-10");
    let progress = createDefaultProgress();
    progress = applyForgivingStreak(progress, { playedToday: true, now });
    expect(progress.stats.currentStreak).toBe(1);
    const nextDay = new Date(2026, 7, 11, 1, 0, 0);
    progress = applyForgivingStreak(progress, { playedToday: true, now: nextDay });
    expect(progress.stats.currentStreak).toBe(2);
    expect(progress.stats.lastPlayDay).toBe("2026-08-11");
  });

  it("does not farm insight on puzzle replay", () => {
    const puzzle = getPuzzleById("tutorial-001")!;
    let board = createBoardState(puzzle, { random: () => 0.4 });
    for (const group of puzzle.groups) {
      board = { ...board, selectedWords: [...group.words] };
      board = submitSelection(board, puzzle);
    }
    let progress = createDefaultProgress();
    progress = applyPuzzleCompletion(progress, puzzle, board);
    const insight = progress.insightPoints;
    const solves = progress.stats.solves;
    progress = applyPuzzleCompletion(progress, puzzle, board);
    expect(progress.insightPoints).toBe(insight);
    expect(progress.stats.solves).toBe(solves);
  });

  it("marks restoration nodes complete and unlocks finale path", () => {
    let progress = createDefaultProgress();
    progress = completeJourneyNode(progress, "celebrity", "cel-restore");
    expect(progress.worldProgress.celebrity!.completedNodeIds).toContain("cel-restore");
    expect(progress.worldProgress.celebrity!.restored).toBe(1);
    progress = completeJourneyNode(progress, "celebrity", "cel-restore");
    expect(progress.worldProgress.celebrity!.restored).toBe(1);
    expect(progress.achievements).toContain("world_restorer");
  });

  it("grants chain_walker when a chain is recorded on first clear", () => {
    const puzzle = getPuzzleById("tutorial-002")!;
    let board = createBoardState(puzzle, { random: () => 0.3 });
    for (const group of puzzle.groups) {
      board = { ...board, selectedWords: [...group.words] };
      board = submitSelection(board, puzzle);
    }
    const progress = applyPuzzleCompletion(createDefaultProgress(), puzzle, board, {
      chain: { toPuzzleId: "easy-001", noun: "Mercury" },
    });
    expect(progress.achievements).toContain("chain_walker");
    expect(progress.chainHistory).toHaveLength(1);
  });
});
