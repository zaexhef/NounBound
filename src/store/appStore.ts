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
  loadProgress,
  loadSettings,
  PlayerProgress,
  PlayerSettings,
  saveActiveBoard,
  saveProgress,
  saveSettings,
  createDefaultProgress,
  createDefaultSettings,
} from "@/features/save/persistence";
import { applyPuzzleCompletion, createCleverSubmission, CleverConnectionSubmission } from "@/features/progression/service";
import { getFeatureFlags, getEconomyConfig, FeatureFlags, EconomyConfig } from "@/features/config";
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
import { SAVE_KEYS } from "@/features/save/persistence";

interface AppState {
  hydrated: boolean;
  progress: PlayerProgress;
  settings: PlayerSettings;
  board: BoardState | null;
  activePuzzle: NounBoundPuzzle | null;
  journeyContext: { worldId?: string; nodeId?: string } | null;
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
    context?: { worldId?: string; nodeId?: string },
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
  setAdRemoval: (value: boolean) => void;
  canSubmit: () => boolean;
}

async function persistBoard(board: BoardState | null) {
  await saveActiveBoard(board);
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
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
    const [progress, settings, board, cleverRaw] = await Promise.all([
      loadProgress(),
      loadSettings(),
      loadActiveBoard(),
      AsyncStorage.getItem(SAVE_KEYS.cleverPending),
    ]);
    const flags = getFeatureFlags();
    const economyConfig = getEconomyConfig();
    const hintInventory = reconcileHints(
      createDefaultHintInventory(economyConfig),
      economyConfig,
    );
    let usableCoins = 0;
    if (flags.economyEnabled) {
      const balances = await economyService.getBalances();
      usableCoins = balances.usableBalance;
    }
    const cleverPending = cleverRaw
      ? (JSON.parse(cleverRaw) as CleverConnectionSubmission[])
      : [];
    const activePuzzle = board ? getPuzzleById(board.puzzleId) ?? null : null;
    set({
      hydrated: true,
      progress,
      settings,
      board,
      activePuzzle,
      flags,
      economyConfig,
      hintInventory,
      usableCoins,
      cleverPending,
    });
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
    if (!board) return;
    const next = toggleCard(board, word);
    set({ board: next });
    await persistBoard(next);
  },

  clearSelection: async () => {
    const { board } = get();
    if (!board) return;
    const next = clearSelection(board);
    set({ board: next });
    await persistBoard(next);
  },

  submit: async () => {
    const { board, activePuzzle, progress, journeyContext, flags, economyConfig } = get();
    if (!board || !activePuzzle) return;
    const next = submitSelection(board, activePuzzle);
    let nextProgress = progress;
    let lastScoreBreakdown = get().lastScoreBreakdown;

    if (next.status === "won" || next.status === "lost") {
      const chain =
        next.status === "won" && activePuzzle.chainNextPuzzleId && activePuzzle.chainRevealNoun
          ? {
              toPuzzleId: activePuzzle.chainNextPuzzleId,
              noun: activePuzzle.chainRevealNoun,
            }
          : undefined;
      nextProgress = applyPuzzleCompletion(progress, activePuzzle, next, {
        worldId: journeyContext?.worldId,
        nodeId: journeyContext?.nodeId,
        chain,
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
    }

    set({ board: next, progress: nextProgress, lastScoreBreakdown });
    await persistBoard(next.status === "playing" ? next : null);
  },

  hint: async () => {
    const { board, activePuzzle, flags, hintInventory, economyConfig, settings } = get();
    if (!board || !activePuzzle) return { ok: false, message: "No active puzzle" };

    if (flags.economyEnabled) {
      const consumed = consumeHintToken(hintInventory, economyConfig);
      if (!consumed.ok) {
        return {
          ok: false,
          message: "No hint tokens available. Wait, spend coins, or watch an eligible ad.",
        };
      }
      set({ hintInventory: consumed.inventory });
    }

    const next = requestHint(board, activePuzzle);
    set({ board: next });
    await persistBoard(next);
    void settings;
    return { ok: true, message: next.lastMessage ?? "Hint applied" };
  },

  nameCategory: async (groupId, choice) => {
    const { board, activePuzzle } = get();
    if (!board || !activePuzzle) return;
    const next = nameCategory(board, groupId, choice, activePuzzle);
    set({ board: next });
    if (next.status === "won") {
      set({
        lastScoreBreakdown: calculateScore({
          mistakesMade: next.mistakesMade,
          hintsUsed: next.hintsUsed,
          categoriesNamedCorrectly: next.categoriesNamedCorrectly,
          isCategoryCollision: activePuzzle.mode === "category_collision",
          completed: true,
        }),
      });
    }
    await persistBoard(next.status === "playing" ? next : null);
  },

  tick: (deltaMs) => {
    const { board } = get();
    if (!board || board.status !== "playing") return;
    set({ board: tickElapsed(board, deltaMs) });
  },

  resetBoard: async () => {
    const { activePuzzle, journeyContext } = get();
    if (!activePuzzle) return;
    await get().startPuzzle(activePuzzle.id, journeyContext ?? undefined);
  },

  submitCleverConnection: async (input) => {
    const { activePuzzle, cleverPending } = get();
    if (!activePuzzle) return;
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
    const result = await economyService.spendCoins({
      idempotencyKey: `hint_skip_${Date.now()}`,
      reason: "hint_regeneration",
      amount: economyConfig.sinks.hintRegeneration,
    });
    if (!result.ok) return { ok: false, message: result.error ?? "Spend failed" };
    set({
      hintInventory: grantHintToken(hintInventory),
      usableCoins: result.usableBalance,
    });
    return { ok: true, message: "Hint token restored" };
  },

  grantSandboxHintFromAd: async () => {
    set({ hintInventory: grantHintToken(get().hintInventory) });
  },

  setAdRemoval: (value) => set({ hasAdRemoval: value }),

  canSubmit: () => {
    const { board } = get();
    return board ? canSubmit(board) : false;
  },
}));
