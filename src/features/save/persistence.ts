import AsyncStorage from "@react-native-async-storage/async-storage";
import { BoardState } from "../game/engine";

export const SAVE_KEYS = {
  meta: "@nounbound/save/meta",
  activeBoard: "@nounbound/save/activeBoard",
  progress: "@nounbound/save/progress",
  settings: "@nounbound/save/settings",
  economy: "@nounbound/save/economy",
  cleverPending: "@nounbound/save/cleverPending",
  hintInventory: "@nounbound/save/hintInventory",
  entitlements: "@nounbound/save/entitlements",
} as const;

export interface SaveMeta {
  schemaVersion: number;
  updatedAt: string;
}

export interface PlayerProgress {
  schemaVersion: number;
  onboardingComplete: boolean;
  tutorialComplete: boolean;
  insightPoints: number;
  playerLevel: number;
  puzzleStars: Record<string, 0 | 1 | 2 | 3>;
  completedPuzzleIds: string[];
  worldProgress: Record<
    string,
    {
      restored: number;
      completedNodeIds: string[];
      finaleComplete: boolean;
    }
  >;
  achievements: string[];
  cosmetics: {
    unlockedCardBacks: string[];
    unlockedBoardThemes: string[];
    unlockedTitles: string[];
    equippedCardBack: string;
    equippedBoardTheme: string;
    equippedTitle: string;
  };
  stats: {
    solves: number;
    losses: number;
    hintsUsed: number;
    perfectBoards: number;
    totalPlayTimeMs: number;
    longestChain: number;
    currentStreak: number;
    bestStreak: number;
    lastPlayDay: string | null;
    streakProtections: number;
  };
  chainHistory: {
    fromPuzzleId: string;
    toPuzzleId: string;
    noun: string;
    at: string;
  }[];
  daily: {
    lastCompletedDay: string | null;
    lastPuzzleId: string | null;
    usedFallback: boolean;
  };
}

export interface PlayerSettings {
  schemaVersion: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export const CURRENT_SAVE_SCHEMA = 2;
export const CURRENT_PROGRESS_SCHEMA = 2;
export const CURRENT_SETTINGS_SCHEMA = 1;

export function createDefaultProgress(): PlayerProgress {
  return {
    schemaVersion: CURRENT_PROGRESS_SCHEMA,
    onboardingComplete: false,
    tutorialComplete: false,
    insightPoints: 0,
    playerLevel: 1,
    puzzleStars: {},
    completedPuzzleIds: [],
    worldProgress: {
      celebrity: { restored: 0, completedNodeIds: [], finaleComplete: false },
      automotive: { restored: 0, completedNodeIds: [], finaleComplete: false },
      objects: { restored: 0, completedNodeIds: [], finaleComplete: false },
      history: { restored: 0, completedNodeIds: [], finaleComplete: false },
    },
    achievements: [],
    cosmetics: {
      unlockedCardBacks: ["archive_default"],
      unlockedBoardThemes: ["living_archive"],
      unlockedTitles: ["Archivist Initiate"],
      equippedCardBack: "archive_default",
      equippedBoardTheme: "living_archive",
      equippedTitle: "Archivist Initiate",
    },
    stats: {
      solves: 0,
      losses: 0,
      hintsUsed: 0,
      perfectBoards: 0,
      totalPlayTimeMs: 0,
      longestChain: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayDay: null,
      streakProtections: 1,
    },
    chainHistory: [],
    daily: {
      lastCompletedDay: null,
      lastPuzzleId: null,
      usedFallback: false,
    },
  };
}

export function createDefaultSettings(): PlayerSettings {
  return {
    schemaVersion: CURRENT_SETTINGS_SCHEMA,
    soundEnabled: true,
    hapticsEnabled: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  };
}

export function migrateProgress(raw: unknown): PlayerProgress {
  if (!raw || typeof raw !== "object") return createDefaultProgress();
  const data = raw as Partial<PlayerProgress> & { schemaVersion?: number };
  const base = createDefaultProgress();
  const version = data.schemaVersion ?? 1;

  // v1 → v2: add streak protections and cosmetics defaults
  const merged: PlayerProgress = {
    ...base,
    ...data,
    schemaVersion: CURRENT_PROGRESS_SCHEMA,
    cosmetics: { ...base.cosmetics, ...(data.cosmetics ?? {}) },
    stats: {
      ...base.stats,
      ...(data.stats ?? {}),
      streakProtections:
        data.stats?.streakProtections ?? (version < 2 ? 1 : base.stats.streakProtections),
    },
    worldProgress: { ...base.worldProgress, ...(data.worldProgress ?? {}) },
    daily: { ...base.daily, ...(data.daily ?? {}) },
    puzzleStars: data.puzzleStars ?? {},
    completedPuzzleIds: data.completedPuzzleIds ?? [],
    achievements: data.achievements ?? [],
    chainHistory: data.chainHistory ?? [],
  };
  return merged;
}

export function migrateSettings(raw: unknown): PlayerSettings {
  if (!raw || typeof raw !== "object") return createDefaultSettings();
  return {
    ...createDefaultSettings(),
    ...(raw as PlayerSettings),
    schemaVersion: CURRENT_SETTINGS_SCHEMA,
  };
}

export function migrateBoardState(raw: unknown): BoardState | null {
  if (!raw || typeof raw !== "object") return null;
  const board = raw as BoardState;
  if (!board.puzzleId || !board.shuffledWords) return null;
  // Forward-only: accept schemaVersion 1
  if (board.schemaVersion !== 1) return null;
  return board;
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const payload = JSON.stringify(value);
  // AsyncStorage setItem is atomic per key on supported platforms.
  await AsyncStorage.setItem(key, payload);
}

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function loadProgress(): Promise<PlayerProgress> {
  const raw = await readJson(SAVE_KEYS.progress);
  return migrateProgress(raw);
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  await writeJson(SAVE_KEYS.progress, {
    ...progress,
    schemaVersion: CURRENT_PROGRESS_SCHEMA,
  });
  await writeJson(SAVE_KEYS.meta, {
    schemaVersion: CURRENT_SAVE_SCHEMA,
    updatedAt: new Date().toISOString(),
  } satisfies SaveMeta);
}

export async function loadSettings(): Promise<PlayerSettings> {
  const raw = await readJson(SAVE_KEYS.settings);
  return migrateSettings(raw);
}

export async function saveSettings(settings: PlayerSettings): Promise<void> {
  await writeJson(SAVE_KEYS.settings, settings);
}

export async function loadActiveBoard(): Promise<BoardState | null> {
  const raw = await readJson(SAVE_KEYS.activeBoard);
  return migrateBoardState(raw);
}

export async function saveActiveBoard(board: BoardState | null): Promise<void> {
  if (!board) {
    await AsyncStorage.removeItem(SAVE_KEYS.activeBoard);
    return;
  }
  await writeJson(SAVE_KEYS.activeBoard, board);
}

export async function clearAllSaves(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(SAVE_KEYS));
}

export interface PersistedEntitlements {
  hasAdRemoval: boolean;
}

export async function loadHintInventoryRaw(): Promise<unknown | null> {
  return readJson(SAVE_KEYS.hintInventory);
}

export async function saveHintInventory(inventory: {
  tokenCount: number;
  capacity: number;
  nextHintAt: string | null;
}): Promise<void> {
  await writeJson(SAVE_KEYS.hintInventory, inventory);
}

export async function loadEntitlements(): Promise<PersistedEntitlements> {
  const raw = await readJson<PersistedEntitlements>(SAVE_KEYS.entitlements);
  return { hasAdRemoval: Boolean(raw?.hasAdRemoval) };
}

export async function saveEntitlements(
  entitlements: PersistedEntitlements,
): Promise<void> {
  await writeJson(SAVE_KEYS.entitlements, entitlements);
}

/**
 * Content updates must not invalidate an active saved puzzle.
 * If the bundled puzzle contentVersion changes, keep the saved board
 * and resolve explanations from the saved contentVersion snapshot when available.
 */
export function canResumeBoard(
  board: BoardState,
  currentContentVersion: number | undefined,
): boolean {
  if (!board || board.status !== "playing") return false;
  // Always allow resume of an active board even if content version differs.
  void currentContentVersion;
  return true;
}
