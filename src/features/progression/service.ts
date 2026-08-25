import { PlayerProgress } from "../save/persistence";
import { BoardState } from "../game/engine";
import { NounBoundPuzzle } from "../content/schema";

export const ACHIEVEMENTS = [
  {
    id: "first_solve",
    title: "First Catalog Entry",
    description: "Complete your first puzzle.",
  },
  {
    id: "perfect_board",
    title: "Flawless Restoration",
    description: "Complete a puzzle with no mistakes and no hints.",
  },
  {
    id: "collision_solver",
    title: "Collision Analyst",
    description: "Complete a Category Collision board.",
  },
  {
    id: "world_restorer",
    title: "Exhibit Restorer",
    description: "Complete a Journey World restoration milestone.",
  },
  {
    id: "chain_walker",
    title: "Connection Walker",
    description: "Follow a Connection Chain into the next puzzle.",
  },
  {
    id: "streak_7",
    title: "Week in the Archive",
    description: "Maintain a 7-day forgiving streak.",
  },
] as const;

export function insightForBoard(board: BoardState): number {
  if (board.status !== "won") return 0;
  return board.score;
}

export function levelFromInsight(insightPoints: number): number {
  return Math.max(1, Math.floor(insightPoints / 2500) + 1);
}

/** Local calendar day key YYYY-MM-DD — consistent with streak diff math. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Forgiving streak: missing one day consumes a protection if available
 * instead of resetting to zero. Service outages for Daily Mystery should
 * not destroy streaks (caller sets usedFallback / skipPenalty).
 */
export function applyForgivingStreak(
  progress: PlayerProgress,
  options: { playedToday: boolean; now?: Date; serviceFailed?: boolean },
): PlayerProgress {
  if (options.serviceFailed) {
    return progress;
  }
  if (!options.playedToday) return progress;

  const now = options.now ?? new Date();
  const today = dayKey(now);
  const stats = { ...progress.stats };
  if (stats.lastPlayDay === today) return progress;

  if (!stats.lastPlayDay) {
    stats.currentStreak = 1;
  } else {
    const [ly, lm, ld] = stats.lastPlayDay.split("-").map(Number);
    const lastUtc = Date.UTC(ly!, (lm ?? 1) - 1, ld ?? 1);
    const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowUtc - lastUtc) / 86400000);
    if (diffDays <= 1) {
      stats.currentStreak += 1;
    } else if (diffDays === 2 && stats.streakProtections > 0) {
      stats.streakProtections -= 1;
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
  }
  stats.lastPlayDay = today;
  stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  return { ...progress, stats };
}

export function applyPuzzleCompletion(
  progress: PlayerProgress,
  puzzle: NounBoundPuzzle,
  board: BoardState,
  options?: {
    worldId?: string;
    nodeId?: string;
    chain?: { toPuzzleId: string; noun: string };
    isDaily?: boolean;
    usedDailyFallback?: boolean;
  },
): PlayerProgress {
  let next = { ...progress };
  const stars = board.stars;
  const previous = next.puzzleStars[puzzle.id] ?? 0;
  next.puzzleStars = {
    ...next.puzzleStars,
    [puzzle.id]: Math.max(previous, stars) as 0 | 1 | 2 | 3,
  };

  const firstClear =
    board.status === "won" && !progress.completedPuzzleIds.includes(puzzle.id);

  if (board.status === "won") {
    if (firstClear) {
      next.completedPuzzleIds = [...next.completedPuzzleIds, puzzle.id];
      next.insightPoints += insightForBoard(board);
      next.playerLevel = levelFromInsight(next.insightPoints);
      next.stats = {
        ...next.stats,
        solves: next.stats.solves + 1,
        hintsUsed: next.stats.hintsUsed + board.hintsUsed,
        perfectBoards:
          next.stats.perfectBoards +
          (board.mistakesMade === 0 && board.hintsUsed === 0 ? 1 : 0),
        totalPlayTimeMs: next.stats.totalPlayTimeMs + board.elapsedMs,
      };
      next = applyForgivingStreak(next, { playedToday: true });
    } else {
      // Replay: keep best stars only; do not farm insight/solves/streak.
      next.stats = {
        ...next.stats,
        totalPlayTimeMs: next.stats.totalPlayTimeMs + board.elapsedMs,
      };
    }
    next = unlockAchievements(next, puzzle, board, {
      ...options,
      firstClear,
    });
  } else if (board.status === "lost") {
    next.stats = {
      ...next.stats,
      losses: next.stats.losses + 1,
      hintsUsed: next.stats.hintsUsed + board.hintsUsed,
      totalPlayTimeMs: next.stats.totalPlayTimeMs + board.elapsedMs,
    };
  }

  if (options?.worldId && options.nodeId && board.status === "won") {
    next = completeJourneyNode(next, options.worldId, options.nodeId);
  }

  if (options?.chain && board.status === "won" && firstClear) {
    next.chainHistory = [
      ...next.chainHistory,
      {
        fromPuzzleId: puzzle.id,
        toPuzzleId: options.chain.toPuzzleId,
        noun: options.chain.noun,
        at: new Date().toISOString(),
      },
    ];
    next.stats = {
      ...next.stats,
      longestChain: Math.max(next.stats.longestChain, next.chainHistory.length),
    };
    if (!next.achievements.includes("chain_walker")) {
      next.achievements = [...next.achievements, "chain_walker"];
    }
  }

  if (options?.isDaily && board.status === "won") {
    next.daily = {
      lastCompletedDay: dayKey(),
      lastPuzzleId: puzzle.id,
      usedFallback: Boolean(options.usedDailyFallback),
    };
  }

  return next;
}

/** Mark a journey node complete (restoration / connection / puzzle). */
export function completeJourneyNode(
  progress: PlayerProgress,
  worldId: string,
  nodeId: string,
): PlayerProgress {
  const world = progress.worldProgress[worldId] ?? {
    restored: 0,
    completedNodeIds: [],
    finaleComplete: false,
  };
  if (world.completedNodeIds.includes(nodeId)) {
    return progress;
  }
  const completedNodeIds = [...world.completedNodeIds, nodeId];
  return {
    ...progress,
    worldProgress: {
      ...progress.worldProgress,
      [worldId]: {
        ...world,
        completedNodeIds,
        finaleComplete: world.finaleComplete || nodeId.includes("finale"),
        restored: nodeId.includes("restore") ? world.restored + 1 : world.restored,
      },
    },
    achievements:
      nodeId.includes("restore") && !progress.achievements.includes("world_restorer")
        ? [...progress.achievements, "world_restorer"]
        : progress.achievements,
  };
}

function unlockAchievements(
  progress: PlayerProgress,
  puzzle: NounBoundPuzzle,
  board: BoardState,
  options?: { nodeId?: string; firstClear?: boolean; chain?: { toPuzzleId: string; noun: string } },
): PlayerProgress {
  const unlocked = new Set(progress.achievements);
  if (board.status === "won") unlocked.add("first_solve");
  if (board.status === "won" && board.mistakesMade === 0 && board.hintsUsed === 0) {
    unlocked.add("perfect_board");
  }
  if (board.status === "won" && puzzle.mode === "category_collision") {
    unlocked.add("collision_solver");
  }
  if (options?.nodeId?.includes("restore")) unlocked.add("world_restorer");
  if (options?.chain) unlocked.add("chain_walker");
  if (progress.stats.currentStreak >= 7) unlocked.add("streak_7");

  const cosmetics = { ...progress.cosmetics };
  if (unlocked.has("perfect_board") && !cosmetics.unlockedCardBacks.includes("archive_gold")) {
    cosmetics.unlockedCardBacks = [...cosmetics.unlockedCardBacks, "archive_gold"];
  }
  if (unlocked.has("collision_solver") && !cosmetics.unlockedTitles.includes("Collision Curator")) {
    cosmetics.unlockedTitles = [...cosmetics.unlockedTitles, "Collision Curator"];
  }

  return {
    ...progress,
    achievements: [...unlocked],
    cosmetics,
  };
}

export interface CleverConnectionSubmission {
  id: string;
  puzzleId: string;
  words: [string, string, string, string];
  connection: string;
  note: string;
  createdAt: string;
  status: "pending_local" | "submitted" | "accepted" | "rejected";
}

/**
 * Clever Connections never override intended solutions or corrupt completion.
 */
export function createCleverSubmission(input: {
  puzzleId: string;
  words: [string, string, string, string];
  connection: string;
  note: string;
}): CleverConnectionSubmission {
  return {
    id: `clever_${Date.now()}`,
    puzzleId: input.puzzleId,
    words: input.words,
    connection: input.connection,
    note: input.note,
    createdAt: new Date().toISOString(),
    status: "pending_local",
  };
}
