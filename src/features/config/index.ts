import Constants from "expo-constants";
import {
  defaultEconomyConfig,
  defaultFeatureFlags,
  EconomyConfig,
  FeatureFlags,
  validateEconomyConfig,
} from "./defaults";

function extra(): Record<string, unknown> {
  return (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
}

export function getFeatureFlags(): FeatureFlags {
  const e = extra();
  return {
    ...defaultFeatureFlags,
    economyEnabled: Boolean(e.enableEconomy) || defaultFeatureFlags.economyEnabled,
    rewardedAdsEnabled:
      Boolean(e.enableRewardedAds) || defaultFeatureFlags.rewardedAdsEnabled,
    interstitialsEnabled: false,
    purchasesEnabled:
      Boolean(e.enablePurchases) || defaultFeatureFlags.purchasesEnabled,
    diagnosticsEnabled:
      (typeof __DEV__ !== "undefined" && __DEV__) ||
      e.appEnv === "development" ||
      e.appEnv === "preview",
  };
}

export function getEconomyConfig(): EconomyConfig {
  return defaultEconomyConfig;
}

/**
 * Remote config activation pipeline (foundation):
 * download → verify → schema validate → range check → store beside prior → activate atomically → rollback on failure.
 */
export function activateRemoteEconomyConfig(
  candidate: unknown,
  previous: EconomyConfig = defaultEconomyConfig,
): { config: EconomyConfig; activated: boolean; error?: string } {
  try {
    const config = validateEconomyConfig(candidate);
    if (config.rewards.easy < 0 || config.sinks.hintRegeneration < 0) {
      return { config: previous, activated: false, error: "negative_values" };
    }
    if (config.hints.capacity < 1) {
      return { config: previous, activated: false, error: "invalid_hint_capacity" };
    }
    return { config, activated: true };
  } catch (error) {
    return {
      config: previous,
      activated: false,
      error: error instanceof Error ? error.message : "validation_failed",
    };
  }
}

export * from "./defaults";
