import { Difficulty, NounBoundPuzzle, normalizeNoun } from "../content/schema";

export type GameStatus = "playing" | "won" | "lost";

export interface SolvedGroupState {
  groupId: string;
  connection: string;
  words: [string, string, string, string];
  namedCorrectly?: boolean;
}

export interface HintState {
  /** Progressive stage 0–4; 0 means no hints used for that group focus. */
  stage: number;
  /** Pinned unsolved group while a progressive hint sequence is active. */
  focusedGroupId?: string;
  lockedWord?: string;
  removedWord?: string;
  revealedLabel?: string;
  broadSubject?: string;
  /** True when the last requestHint call changed board assistance state. */
  applied?: boolean;
}

export interface BoardState {
  schemaVersion: 1;
  puzzleId: string;
  contentVersion: number;
  difficulty: Difficulty;
  mode: NounBoundPuzzle["mode"];
  /** Display order; never mutates canonical solution data. */
  shuffledWords: string[];
  selectedWords: string[];
  solvedGroups: SolvedGroupState[];
  mistakesRemaining: number;
  mistakesMade: number;
  hintsUsed: number;
  hintState: HintState;
  /** Words removed from the active grid by hints. */
  removedWords: string[];
  /** Words locked into selection assistance by hints. */
  lockedHintWords: string[];
  oneAwayVisible: boolean;
  lastMessage: string | null;
  score: number;
  stars: 0 | 1 | 2 | 3;
  categoriesNamedCorrectly: number;
  collisionBonusAwarded: boolean;
  startedAt: string;
  elapsedMs: number;
  status: GameStatus;
}

export interface ScoreBreakdown {
  base: number;
  noMistakes: number;
  noHints: number;
  namedCategories: number;
  collisionBonus: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
}

const MAX_SELECTION = 4;
const MAX_MISTAKES = 3;
const SAVE_SCHEMA = 1 as const;

function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

function wordsMatchGroup(
  selected: string[],
  groupWords: readonly string[],
): boolean {
  if (selected.length !== 4) return false;
  const selectedNorm = new Set(selected.map(normalizeNoun));
  const groupNorm = new Set(groupWords.map(normalizeNoun));
  if (selectedNorm.size !== 4 || groupNorm.size !== 4) return false;
  for (const w of selectedNorm) {
    if (!groupNorm.has(w)) return false;
  }
  return true;
}

function countOverlap(selected: string[], groupWords: readonly string[]): number {
  const groupNorm = new Set(groupWords.map(normalizeNoun));
  return selected.map(normalizeNoun).filter((w) => groupNorm.has(w)).length;
}

export function shouldShowOneAway(difficulty: Difficulty): boolean {
  return difficulty === "tutorial" || difficulty === "easy" || difficulty === "normal";
}

export function calculateScore(input: {
  mistakesMade: number;
  hintsUsed: number;
  categoriesNamedCorrectly: number;
  isCategoryCollision: boolean;
  completed: boolean;
}): ScoreBreakdown {
  if (!input.completed) {
    return {
      base: 0,
      noMistakes: 0,
      noHints: 0,
      namedCategories: 0,
      collisionBonus: 0,
      total: 0,
      stars: 0,
    };
  }

  const base = 1000;
  const noMistakes = input.mistakesMade === 0 ? 250 : 0;
  const noHints = input.hintsUsed === 0 ? 150 : 0;
  const namedCategories = input.categoriesNamedCorrectly * 100;
  const collisionBonus = input.isCategoryCollision ? 100 : 0;
  const total = base + noMistakes + noHints + namedCategories + collisionBonus;

  let stars: 0 | 1 | 2 | 3 = 1;
  if (input.mistakesMade === 0 && input.hintsUsed === 0) {
    stars = 3;
  } else if (input.mistakesMade + input.hintsUsed <= 1) {
    stars = 2;
  }

  return {
    base,
    noMistakes,
    noHints,
    namedCategories,
    collisionBonus,
    total,
    stars,
  };
}

export function createBoardState(
  puzzle: NounBoundPuzzle,
  options?: { random?: () => number; now?: () => Date },
): BoardState {
  const random = options?.random ?? Math.random;
  const now = options?.now ?? (() => new Date());
  const allWords = puzzle.groups.flatMap((g) => g.words);

  return {
    schemaVersion: SAVE_SCHEMA,
    puzzleId: puzzle.id,
    contentVersion: puzzle.contentVersion,
    difficulty: puzzle.difficulty,
    mode: puzzle.mode,
    shuffledWords: shuffle(allWords, random),
    selectedWords: [],
    solvedGroups: [],
    mistakesRemaining: MAX_MISTAKES,
    mistakesMade: 0,
    hintsUsed: 0,
    hintState: { stage: 0 },
    removedWords: [],
    lockedHintWords: [],
    oneAwayVisible: false,
    lastMessage: null,
    score: 0,
    stars: 0,
    categoriesNamedCorrectly: 0,
    collisionBonusAwarded: false,
    startedAt: now().toISOString(),
    elapsedMs: 0,
    status: "playing",
  };
}

export function getActiveWords(state: BoardState): string[] {
  const solved = new Set(
    state.solvedGroups.flatMap((g) => g.words.map(normalizeNoun)),
  );
  const removed = new Set(state.removedWords.map(normalizeNoun));
  return state.shuffledWords.filter((w) => {
    const n = normalizeNoun(w);
    return !solved.has(n) && !removed.has(n);
  });
}

export function toggleCard(state: BoardState, word: string): BoardState {
  if (state.status !== "playing") return state;

  const active = new Set(getActiveWords(state).map(normalizeNoun));
  if (!active.has(normalizeNoun(word))) return state;

  const selectedNorm = state.selectedWords.map(normalizeNoun);
  const wordNorm = normalizeNoun(word);
  const exists = selectedNorm.includes(wordNorm);
  const locked = state.lockedHintWords.map(normalizeNoun);

  let selectedWords: string[];
  if (exists) {
    // Locked hint nouns cannot be deselected.
    if (locked.includes(wordNorm)) return state;
    selectedWords = state.selectedWords.filter(
      (w) => normalizeNoun(w) !== wordNorm,
    );
  } else {
    if (state.selectedWords.length >= MAX_SELECTION) return state;
    selectedWords = [...state.selectedWords, word];
  }

  return {
    ...state,
    selectedWords,
    oneAwayVisible: false,
    lastMessage: null,
  };
}

export function clearSelection(state: BoardState): BoardState {
  if (state.status !== "playing") return state;
  const lockedNorm = new Set(state.lockedHintWords.map(normalizeNoun));
  return {
    ...state,
    selectedWords: state.selectedWords.filter((w) =>
      lockedNorm.has(normalizeNoun(w)),
    ),
    oneAwayVisible: false,
    lastMessage: null,
  };
}

export function submitSelection(
  state: BoardState,
  puzzle: NounBoundPuzzle,
): BoardState {
  if (state.status !== "playing") return state;
  if (state.selectedWords.length !== MAX_SELECTION) return state;
  if (state.puzzleId !== puzzle.id) {
    throw new Error("Puzzle ID mismatch during submitSelection");
  }

  const unsolved = puzzle.groups.filter(
    (g) => !state.solvedGroups.some((s) => s.groupId === g.id),
  );

  const matched = unsolved.find((g) =>
    wordsMatchGroup(state.selectedWords, g.words),
  );

  if (matched) {
    const solvedGroups: SolvedGroupState[] = [
      ...state.solvedGroups,
      {
        groupId: matched.id,
        connection: matched.connection,
        words: matched.words,
      },
    ];

    const won = solvedGroups.length === 4;
    let next: BoardState = {
      ...state,
      solvedGroups,
      selectedWords: [],
      oneAwayVisible: false,
      lastMessage: won
        ? "All groups solved."
        : `Solved: ${matched.connection}`,
      lockedHintWords: state.lockedHintWords.filter(
        (w) => !matched.words.map(normalizeNoun).includes(normalizeNoun(w)),
      ),
      hintState: { stage: 0 },
      status: won ? "won" : "playing",
    };

    if (won) {
      const breakdown = calculateScore({
        mistakesMade: next.mistakesMade,
        hintsUsed: next.hintsUsed,
        categoriesNamedCorrectly: next.categoriesNamedCorrectly,
        isCategoryCollision: puzzle.mode === "category_collision",
        completed: true,
      });
      next = {
        ...next,
        score: breakdown.total,
        stars: breakdown.stars,
        collisionBonusAwarded: puzzle.mode === "category_collision",
      };
    }

    return next;
  }

  // Incorrect
  const mistakesRemaining = state.mistakesRemaining - 1;
  const mistakesMade = state.mistakesMade + 1;
  const lost = mistakesRemaining <= 0;

  let oneAway = false;
  if (shouldShowOneAway(state.difficulty)) {
    oneAway = unsolved.some(
      (g) => countOverlap(state.selectedWords, g.words) === 3,
    );
  }

  let next: BoardState = {
    ...state,
    mistakesRemaining,
    mistakesMade,
    selectedWords: lost ? state.selectedWords : [],
    oneAwayVisible: oneAway && !lost,
    lastMessage: lost
      ? "No mistakes remaining. Solution revealed."
      : oneAway
        ? "One away."
        : "Not a group.",
    status: lost ? "lost" : "playing",
  };

  if (lost) {
    // Reveal remaining groups without awarding completion score.
    const remaining = unsolved.map((g) => ({
      groupId: g.id,
      connection: g.connection,
      words: g.words,
    }));
    next = {
      ...next,
      solvedGroups: [...state.solvedGroups, ...remaining],
      score: 0,
      stars: 0,
    };
  }

  return next;
}

/**
 * Progressive hints:
 * 1. Broad subject
 * 2. Lock one correct noun
 * 3. Remove one deceptive candidate
 * 4. Reveal group label
 */
export function requestHint(
  state: BoardState,
  puzzle: NounBoundPuzzle,
): BoardState {
  if (state.status !== "playing") return state;
  if (state.puzzleId !== puzzle.id) {
    throw new Error("Puzzle ID mismatch during requestHint");
  }

  const unsolved = puzzle.groups.filter(
    (g) => !state.solvedGroups.some((s) => s.groupId === g.id),
  );
  if (unsolved.length === 0) {
    return { ...state, lastMessage: "No unsolved groups remain.", hintState: { ...state.hintState, applied: false } };
  }

  const pinned = state.hintState.focusedGroupId
    ? unsolved.find((g) => g.id === state.hintState.focusedGroupId)
    : undefined;
  // Pin focus for the progressive sequence; only re-pick when starting a new sequence.
  const focus =
    pinned ??
    unsolved
      .map((g) => ({
        group: g,
        overlap: countOverlap(state.selectedWords, g.words),
      }))
      .sort((a, b) => b.overlap - a.overlap)[0]?.group ??
    unsolved[0]!;

  const stage = state.hintState.stage + 1;
  if (stage > 4) {
    return {
      ...state,
      lastMessage: "No further hints for this group.",
      hintState: { ...state.hintState, applied: false },
    };
  }

  let hintState: HintState = {
    ...state.hintState,
    stage,
    focusedGroupId: focus.id,
    applied: true,
  };
  let lockedHintWords = [...state.lockedHintWords];
  let removedWords = [...state.removedWords];
  let selectedWords = [...state.selectedWords];
  let lastMessage = "";
  let applied = true;

  if (stage === 1) {
    const broad = focus.hints[0];
    hintState = { ...hintState, broadSubject: broad };
    lastMessage = broad;
  } else if (stage === 2) {
    const word =
      focus.words.find(
        (w) => !lockedHintWords.map(normalizeNoun).includes(normalizeNoun(w)),
      ) ?? focus.words[0]!;
    lockedHintWords = [...lockedHintWords, word];
    if (!selectedWords.map(normalizeNoun).includes(normalizeNoun(word))) {
      if (selectedWords.length >= MAX_SELECTION) {
        const unlockedIndex = selectedWords.findIndex(
          (w) => !lockedHintWords.map(normalizeNoun).includes(normalizeNoun(w)),
        );
        if (unlockedIndex >= 0) {
          selectedWords = selectedWords.filter((_, i) => i !== unlockedIndex);
        } else {
          selectedWords = selectedWords.slice(0, MAX_SELECTION - 1);
        }
      }
      selectedWords = [...selectedWords, word];
    }
    hintState = { ...hintState, lockedWord: word };
    lastMessage = `Locked in: ${word}`;
  } else if (stage === 3) {
    const active = getActiveWords(state);
    const focusNorm = new Set(focus.words.map(normalizeNoun));
    const decoy = active.find((w) => !focusNorm.has(normalizeNoun(w)));
    if (decoy) {
      removedWords = [...removedWords, decoy];
      selectedWords = selectedWords.filter(
        (w) => normalizeNoun(w) !== normalizeNoun(decoy),
      );
      hintState = { ...hintState, removedWord: decoy };
      lastMessage = `Removed: ${decoy}`;
    } else {
      lastMessage = "No deceptive candidate left to remove.";
      applied = false;
      hintState = { ...hintState, applied: false };
    }
  } else {
    hintState = { ...hintState, revealedLabel: focus.connection };
    lastMessage = `Group label: ${focus.connection}`;
  }

  return {
    ...state,
    hintState,
    lockedHintWords,
    removedWords,
    selectedWords,
    hintsUsed: applied ? state.hintsUsed + 1 : state.hintsUsed,
    lastMessage,
    oneAwayVisible: false,
  };
}

export function nameCategory(
  state: BoardState,
  groupId: string,
  choice: string,
  puzzle: NounBoundPuzzle,
): BoardState {
  if (state.status !== "won" && state.status !== "playing") return state;
  const group = puzzle.groups.find((g) => g.id === groupId);
  const solved = state.solvedGroups.find((g) => g.groupId === groupId);
  if (!group || !solved || solved.namedCorrectly) return state;

  const correct =
    normalizeNoun(choice) === normalizeNoun(group.connection) ||
    normalizeNoun(choice) === normalizeNoun(group.hints[3] ?? "");

  if (!correct) {
    return {
      ...state,
      lastMessage: "Category name incorrect.",
    };
  }

  const solvedGroups = state.solvedGroups.map((g) =>
    g.groupId === groupId ? { ...g, namedCorrectly: true } : g,
  );
  const categoriesNamedCorrectly = state.categoriesNamedCorrectly + 1;

  let next: BoardState = {
    ...state,
    solvedGroups,
    categoriesNamedCorrectly,
    lastMessage: "Category named correctly (+100).",
  };

  if (next.status === "won") {
    const breakdown = calculateScore({
      mistakesMade: next.mistakesMade,
      hintsUsed: next.hintsUsed,
      categoriesNamedCorrectly,
      isCategoryCollision: puzzle.mode === "category_collision",
      completed: true,
    });
    next = { ...next, score: breakdown.total, stars: breakdown.stars };
  }

  return next;
}

export function tickElapsed(state: BoardState, deltaMs: number): BoardState {
  if (state.status !== "playing") return state;
  return { ...state, elapsedMs: Math.max(0, state.elapsedMs + deltaMs) };
}

export function canSubmit(state: BoardState): boolean {
  return state.status === "playing" && state.selectedWords.length === MAX_SELECTION;
}

export function revealSolutionOnLoss(
  state: BoardState,
  puzzle: NounBoundPuzzle,
): BoardState {
  if (state.status !== "lost") return state;
  return {
    ...state,
    solvedGroups: puzzle.groups.map((g) => ({
      groupId: g.id,
      connection: g.connection,
      words: g.words,
    })),
  };
}

export const GAME_CONSTANTS = {
  MAX_SELECTION,
  MAX_MISTAKES,
  SAVE_SCHEMA,
};
