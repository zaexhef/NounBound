import { create } from "zustand";
import {
  BoardState,
  calculateScore,
  canSubmit,
  clearSelection,
  createBoardState,
  nameCategory,
  requestHint,
  submitSelection,
  tickElapsed,
  toggleCard,
} from "@/features/game/engine";
import { getPuzzleById } from "@/features/content/loader";
import { NounBoundPuzzle } from "@/features/content/schema";
import {
  loadActiveBoard,
  loadEntitlements,
  loadHintInventoryRaw,
  loadProgress,
  loadSettings,
  PlayerProgress,
  PlayerSettings,
  saveActiveBoard,
  saveEntitlements,
  saveHintInventory,
  saveProgress,
  saveSettings,
  createDefaultProgress,
  createDefaultSettings,
  SAVE_KEYS,
} from "@/features/save/persistence";
import {
  applyPuzzleCompletion,
  completeJourneyNode,
  createCleverSubmission,
  CleverConnectionSubmission,
} from "@/features/progression/service";
import {
  getFeatureFlags,
  getEconomyConfig,
  FeatureFlags,
  EconomyConfig,
} from "@/features/config";
import { economyService } from "@/features/economy/service";
import {
  consumeHintToken,
  createDefaultHintInventory,
  grantHintToken,
  HintInventory,
  reconcileHints,
} from "@/features/timers/service";
import { initSqliteEconomyStore } from "@/features/save/sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  hydrated: boolean;
  submitting: boolean;
  progress: PlayerProgress;
  settings: PlayerSettings;
  board: BoardState | null;
  activePuzzle: NounBoundPuzzle | null;
  journeyContext: { worldId?: string; nodeId?: string; isDaily?: boolean; usedDailyFallback?: boolean } | null;
  flags: FeatureFlags;
  economyConfig: EconomyConfig;
  hintInventory: HintInventory;
  usableCoins: number;
  hasAdRemoval: boolean;
  cleverPending: CleverConnectionSubmission[];
  lastScoreBreakdown: ReturnType<typeof calculateScore> | null;
  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<PlayerSettings>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  startPuzzle: (
    puzzleId: string,
    context?: { worldId?: string; nodeId?: string; isDaily?: boolean; usedDailyFallback?: boolean },
  ) => Promise<void>;
  resumeActivePuzzle: () => Promise<boolean>;
  toggleCard: (word: string) => Promise<void>;
  clearSelection: () => Promise<void>;
  submit: () => Promise<void>;
  hint: () => Promise<{ ok: boolean; message: string }>;
  nameCategory: (groupId: string, choice: string) => Promise<void>;
  tick: (deltaMs: number) => void;
  resetBoard: () => Promise<void>;
  submitCleverConnection: (input: {
    words: [string, string, string, string];
    connection: string;
    note: string;
  }) => Promise<void>;
  refreshEconomy: () => Promise<void>;
  skipHintTimerWithCoins: () => Promise<{ ok: boolean; message: string }>;
  grantSandboxHintFromAd: () => Promise<void>;
  setAdRemoval: (value: boolean) => Promise<void>;
  completeJourneyNode: (worldId: string, nodeId: string) => Promise<void>;
  unlockCosmetics: (ids: string[]) => Promise<void>;
  canSubmit: () => boolean;
}

async function persistBoard(board: BoardState | null) {
  await saveActiveBoard(board);
}

async function persistHints(inventory: HintInventory) {
  await saveHintInventory(inventory);
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  submitting: false,
  progress: createDefaultProgress(),
  settings: createDefaultSettings(),
  board: null,
  activePuzzle: null,
  journeyContext: null,
  flags: getFeatureFlags(),
  economyConfig: getEconomyConfig(),
  hintInventory: createDefaultHintInventory(getEconomyConfig()),
  usableCoins: 0,
  hasAdRemoval: false,
  cleverPending: [],
  lastScoreBreakdown: null,

  hydrate: async () => {
    await initSqliteEconomyStore();
    const [progress, settings, board, cleverRaw, hintRaw, entitlements] =
      await Promise.all([
        loadProgress(),
        loadSettings(),
        loadActiveBoard(),
        AsyncStorage.getItem(SAVE_KEYS.cleverPending),
        loadHintInventoryRaw(),
        loadEntitlements(),
      ]);
    const flags = getFeatureFlags();
    const economyConfig = getEconomyConfig();
    const defaults = createDefaultHintInventory(economyConfig);
    const loadedHints: HintInventory =
      hintRaw && typeof hintRaw === "object"
        ? {
            tokenCount: Math.min(
              economyConfig.hints.capacity,
              Math.max(0, Number((hintRaw as HintInventory).tokenCount) || 0),
            ),
            capacity: economyConfig.hints.capacity,
            nextHintAt: (hintRaw as HintInventory).nextHintAt ?? null,
          }
        : defaults;
    const hintInventory = reconcileHints(loadedHints, economyConfig);
    let usableCoins = 0;
    if (flags.economyEnabled) {
      const balances = await economyService.getBalances();
      usableCoins = balances.usableBalance;
    }
    const cleverPending = cleverRaw
      ? (JSON.parse(cleverRaw) as CleverConnectionSubmission[])
      : [];
    let activeBoard = board;
    let activePuzzle = board ? getPuzzleById(board.puzzleId) ?? null : null;
    if (board && !activePuzzle) {
      // Unknown/retired puzzle id — clear invalid resume without silently mutating known boards.
      activeBoard = null;
      await persistBoard(null);
    }
    set({
      hydrated: true,
      progress,
      settings,
      board: activeBoard,
      activePuzzle,
      flags,
      economyConfig,
      hintInventory,
      usableCoins,
      hasAdRemoval: entitlements.hasAdRemoval,
      cleverPending,
    });
    await persistHints(hintInventory);
  },

  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await saveSettings(settings);
  },

  completeOnboarding: async () => {
    const progress = {
      ...get().progress,
      onboardingComplete: true,
      tutorialComplete: true,
    };
    set({ progress });
    await saveProgress(progress);
  },

  startPuzzle: async (puzzleId, context) => {
    const puzzle = getPuzzleById(puzzleId);
    if (!puzzle) throw new Error(`Unknown puzzle ${puzzleId}`);
    const board = createBoardState(puzzle);
    set({
      board,
      activePuzzle: puzzle,
      journeyContext: context ?? null,
      lastScoreBreakdown: null,
      submitting: false,
    });
    await persistBoard(board);
  },

  resumeActivePuzzle: async () => {
    const board = get().board ?? (await loadActiveBoard());
    if (!board || board.status !== "playing") return false;
    const puzzle = getPuzzleById(board.puzzleId);
    if (!puzzle) return false;
    set({ board, activePuzzle: puzzle });
    return true;
  },

  toggleCard: async (word) => {
    const { board } = get();
    if (!board || board.status !== "playing") return;
    const next = toggleCard(board, word);
    set({ board: next });
    await persistBoard(next);
  },

  clearSelection: async () => {
    const { board } = get();
    if (!board || board.status !== "playing") return;
    const next = clearSelection(board);
    set({ board: next });
    await persistBoard(next);
  },

  submit: async () => {
    const {
      board,
      activePuzzle,
      progress,
      journeyContext,
      flags,
      economyConfig,
      submitting,
    } = get();
    if (!board || !activePuzzle || board.status !== "playing" || submitting) return;

    const next = submitSelection(board, activePuzzle);
    // Lock terminal state immediately to prevent double-submit races.
    set({ board: next, submitting: next.status !== "playing" });

    let nextProgress = progress;
    let lastScoreBreakdown = get().lastScoreBreakdown;

    if (next.status === "won" || next.status === "lost") {
      const chain =
        next.status === "won" &&
        activePuzzle.chainNextPuzzleId &&
        activePuzzle.chainRevealNoun
          ? {
              toPuzzleId: activePuzzle.chainNextPuzzleId,
              noun: activePuzzle.chainRevealNoun,
            }
          : undefined;
      nextProgress = applyPuzzleCompletion(progress, activePuzzle, next, {
        worldId: journeyContext?.worldId,
        nodeId: journeyContext?.nodeId,
        chain,
        isDaily: journeyContext?.isDaily,
        usedDailyFallback: journeyContext?.usedDailyFallback,
      });
      if (next.status === "won") {
        lastScoreBreakdown = calculateScore({
          mistakesMade: next.mistakesMade,
          hintsUsed: next.hintsUsed,
          categoriesNamedCorrectly: next.categoriesNamedCorrectly,
          isCategoryCollision: activePuzzle.mode === "category_collision",
          completed: true,
        });
        if (flags.economyEnabled) {
          const rewardKey =
            activePuzzle.difficulty === "tutorial"
              ? "tutorial"
              : activePuzzle.difficulty;
          const amount = economyConfig.rewards[rewardKey];
          const reasonMap = {
            tutorial: "puzzle_complete_tutorial",
            easy: "puzzle_complete_easy",
            normal: "puzzle_complete_normal",
            hard: "puzzle_complete_hard",
            expert: "puzzle_complete_expert",
          } as const;
          await economyService.awardCoins({
            idempotencyKey: `complete_${activePuzzle.id}_${next.startedAt}`,
            reason: reasonMap[activePuzzle.difficulty],
            amount,
            relatedPuzzleId: activePuzzle.id,
          });
          if (next.mistakesMade === 0 && next.hintsUsed === 0) {
            await economyService.awardCoins({
              idempotencyKey: `perfect_${activePuzzle.id}_${next.startedAt}`,
              reason: "perfect_bonus",
              amount: economyConfig.rewards.perfectBonus,
              relatedPuzzleId: activePuzzle.id,
            });
          }
          const balances = await economyService.getBalances();
          set({ usableCoins: balances.usableBalance });
        }
      }
      await saveProgress(nextProgress);
      set({ progress: nextProgress, lastScoreBreakdown });
      await persistBoard(null);
      set({ submitting: false });
      return;
    }

    set({ lastScoreBreakdown });
    await persistBoard(next);
    set({ submitting: false });
  },

  hint: async () => {
    const { board, activePuzzle, flags, hintInventory, economyConfig } = get();
    if (!board || !activePuzzle) return { ok: false, message: "No active puzzle" };
    if (board.status !== "playing") return { ok: false, message: "Puzzle is not active" };

    const next = requestHint(board, activePuzzle);
    const applied = next.hintState.applied !== false && next !== board;
    const meaningful =
      next.hintsUsed > board.hintsUsed ||
      next.lockedHintWords.length !== board.lockedHintWords.length ||
      next.removedWords.length !== board.removedWords.length ||
      next.hintState.revealedLabel !== board.hintState.revealedLabel ||
      next.hintState.broadSubject !== board.hintState.broadSubject;

    if (!meaningful) {
      set({ board: { ...next, hintState: { ...next.hintState, applied: false } } });
      return { ok: false, message: next.lastMessage ?? "No hint available" };
    }

    if (flags.economyEnabled) {
      const consumed = consumeHintToken(hintInventory, economyConfig);
      if (!consumed.ok) {
        return {
          ok: false,
          message:
            "No hint tokens available. Wait, spend coins, or watch an eligible ad.",
        };
      }
      set({ hintInventory: consumed.inventory });
      await persistHints(consumed.inventory);
    }

    set({ board: next });
    await persistBoard(next);
    void applied;
    return { ok: true, message: next.lastMessage ?? "Hint applied" };
  },

  nameCategory: async (groupId, choice) => {
    const { board, activePuzzle, progress } = get();
    if (!board || !activePuzzle) return;
    const next = nameCategory(board, groupId, choice, activePuzzle);
    set({ board: next });
    if (next.status === "won") {
      const breakdown = calculateScore({
        mistakesMade: next.mistakesMade,
        hintsUsed: next.hintsUsed,
        categoriesNamedCorrectly: next.categoriesNamedCorrectly,
        isCategoryCollision: activePuzzle.mode === "category_collision",
        completed: true,
      });
      // Reflect naming bonus into insight if this was already completed.
      const insightDelta = breakdown.total - (get().lastScoreBreakdown?.total ?? next.score);
      if (insightDelta > 0 && progress.completedPuzzleIds.includes(activePuzzle.id)) {
        const updated = {
          ...progress,
          insightPoints: progress.insightPoints + insightDelta,
        };
        set({ progress: updated, lastScoreBreakdown: breakdown });
        await saveProgress(updated);
      } else {
        set({ lastScoreBreakdown: breakdown });
      }
    }
    await persistBoard(next.status === "playing" ? next : null);
  },

  tick: (deltaMs) => {
    const { board } = get();
    if (!board || board.status !== "playing") return;
    const next = tickElapsed(board, deltaMs);
    set({ board: next });
    // Persist elapsed time every 15s so interruption keeps playtime.
    if (next.elapsedMs > 0 && next.elapsedMs % 15000 < 1000) {
      void persistBoard(next);
    }
  },

  resetBoard: async () => {
    const { activePuzzle, journeyContext } = get();
    if (!activePuzzle) return;
    await get().startPuzzle(activePuzzle.id, journeyContext ?? undefined);
  },

  submitCleverConnection: async (input) => {
    const { activePuzzle, cleverPending } = get();
    if (!activePuzzle) return;
    if (!input.words || input.words.length !== 4 || input.words.some((w) => !w)) {
      return;
    }
    const submission = createCleverSubmission({
      puzzleId: activePuzzle.id,
      ...input,
    });
    const next = [...cleverPending, submission];
    set({ cleverPending: next });
    await AsyncStorage.setItem(SAVE_KEYS.cleverPending, JSON.stringify(next));
  },

  refreshEconomy: async () => {
    const balances = await economyService.getBalances();
    set({ usableCoins: balances.usableBalance });
  },

  skipHintTimerWithCoins: async () => {
    const { flags, economyConfig, hintInventory } = get();
    if (!flags.economyEnabled) return { ok: false, message: "Economy disabled" };
    const reconciled = reconcileHints(hintInventory, economyConfig);
    if (reconciled.tokenCount >= reconciled.capacity) {
      return { ok: false, message: "Hint tokens already full" };
    }
    const idempotencyKey = `hint_skip_${reconciled.nextHintAt ?? "empty"}_${reconciled.tokenCount}`;
    const result = await economyService.spendCoins({
      idempotencyKey,
      reason: "hint_regeneration",
      amount: economyConfig.sinks.hintRegeneration,
      relatedTimerId: reconciled.nextHintAt ?? undefined,
    });
    if (!result.ok) return { ok: false, message: result.error ?? "Spend failed" };
    const granted = grantHintToken(reconciled);
    set({
      hintInventory: granted,
      usableCoins: result.usableBalance,
    });
    await persistHints(granted);
    return { ok: true, message: "Hint token restored" };
  },

  grantSandboxHintFromAd: async () => {
    const granted = grantHintToken(get().hintInventory);
    set({ hintInventory: granted });
    await persistHints(granted);
  },

  setAdRemoval: async (value) => {
    set({ hasAdRemoval: value });
    await saveEntitlements({ hasAdRemoval: value });
  },

  completeJourneyNode: async (worldId, nodeId) => {
    const progress = completeJourneyNode(get().progress, worldId, nodeId);
    set({ progress });
    await saveProgress(progress);
  },

  unlockCosmetics: async (ids) => {
    const progress = get().progress;
    const unlockedCardBacks = [...progress.cosmetics.unlockedCardBacks];
    for (const id of ids) {
      if (!unlockedCardBacks.includes(id)) unlockedCardBacks.push(id);
    }
    const next = {
      ...progress,
      cosmetics: { ...progress.cosmetics, unlockedCardBacks },
    };
    set({ progress: next });
    await saveProgress(next);
  },

  canSubmit: () => {
    const { board, submitting } = get();
    return !!board && !submitting && canSubmit(board);
  },
}));
