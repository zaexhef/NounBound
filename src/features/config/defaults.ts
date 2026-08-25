import { z } from "zod";

export const EconomyConfigSchema = z.object({
  version: z.number().int().positive(),
  rewards: z.object({
    easy: z.number().int().nonnegative(),
    normal: z.number().int().nonnegative(),
    hard: z.number().int().nonnegative(),
    expert: z.number().int().nonnegative(),
    tutorial: z.number().int().nonnegative(),
    perfectBonus: z.number().int().nonnegative(),
    firstPuzzleOfDay: z.number().int().nonnegative(),
    dailyChallenge: z.number().int().nonnegative(),
    sevenDayStreak: z.number().int().nonnegative(),
    worldCompletion: z.number().int().nonnegative(),
    rewardedAdMin: z.number().int().nonnegative(),
    rewardedAdMax: z.number().int().nonnegative(),
  }),
  sinks: z.object({
    hintRegeneration: z.number().int().nonnegative(),
    dailyChest: z.number().int().nonnegative(),
    secondChance: z.number().int().nonnegative(),
    challengePack: z.number().int().nonnegative(),
  }),
  hints: z.object({
    capacity: z.number().int().positive(),
    regenMs: z.number().int().positive(),
  }),
  timers: z.object({
    dailyChestMs: z.number().int().positive(),
    secondChanceMs: z.number().int().positive(),
    challengePackMs: z.number().int().positive(),
  }),
  ads: z.object({
    interstitialEveryMin: z.number().int().positive(),
    interstitialEveryMax: z.number().int().positive(),
    dailyCap: z.number().int().nonnegative(),
    sessionCap: z.number().int().nonnegative(),
    cooldownMs: z.number().int().nonnegative(),
  }),
});

export type EconomyConfig = z.infer<typeof EconomyConfigSchema>;

export const defaultEconomyConfig: EconomyConfig = {
  version: 1,
  rewards: {
    easy: 10,
    normal: 15,
    hard: 25,
    expert: 40,
    tutorial: 5,
    perfectBonus: 10,
    firstPuzzleOfDay: 20,
    dailyChallenge: 50,
    sevenDayStreak: 150,
    worldCompletion: 250,
    rewardedAdMin: 20,
    rewardedAdMax: 30,
  },
  sinks: {
    hintRegeneration: 20,
    dailyChest: 60,
    secondChance: 35,
    challengePack: 100,
  },
  hints: {
    capacity: 3,
    regenMs: 15 * 60 * 1000,
  },
  timers: {
    dailyChestMs: 4 * 60 * 60 * 1000,
    secondChanceMs: 30 * 60 * 1000,
    challengePackMs: 2 * 60 * 60 * 1000,
  },
  ads: {
    interstitialEveryMin: 4,
    interstitialEveryMax: 6,
    dailyCap: 8,
    sessionCap: 4,
    cooldownMs: 3 * 60 * 1000,
  },
};

export const FeatureFlagsSchema = z.object({
  economyEnabled: z.boolean(),
  rewardedAdsEnabled: z.boolean(),
  interstitialsEnabled: z.boolean(),
  purchasesEnabled: z.boolean(),
  remoteConfigEnabled: z.boolean(),
  incompleteModesVisible: z.boolean(),
  diagnosticsEnabled: z.boolean(),
  contextShiftEnabled: z.boolean(),
  deceptiveNounEnabled: z.boolean(),
  chainBuilderEnabled: z.boolean(),
  oddNounOutEnabled: z.boolean(),
  timelineSortEnabled: z.boolean(),
  reversePuzzleEnabled: z.boolean(),
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const defaultFeatureFlags: FeatureFlags = {
  economyEnabled: false,
  rewardedAdsEnabled: false,
  interstitialsEnabled: false,
  purchasesEnabled: false,
  remoteConfigEnabled: false,
  incompleteModesVisible: false,
  diagnosticsEnabled: typeof __DEV__ !== "undefined" ? __DEV__ : false,
  contextShiftEnabled: false,
  deceptiveNounEnabled: false,
  chainBuilderEnabled: false,
  oddNounOutEnabled: false,
  timelineSortEnabled: false,
  reversePuzzleEnabled: false,
};

export function validateEconomyConfig(raw: unknown): EconomyConfig {
  return EconomyConfigSchema.parse(raw);
}
