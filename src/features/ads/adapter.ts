export type AdPlacement =
  | "rewarded_coins"
  | "rewarded_hint"
  | "rewarded_timer"
  | "rewarded_double_coins"
  | "rewarded_chest"
  | "rewarded_second_chance"
  | "interstitial_results";

export type AdResultStatus =
  | "unavailable"
  | "cancelled"
  | "failed"
  | "completed"
  | "pending";

export interface AdEligibilityInput {
  placement: AdPlacement;
  hasAdRemoval: boolean;
  consented: boolean;
  ageGatePassed: boolean;
  platformAllowed: boolean;
  regionAllowed: boolean;
  dailyCount: number;
  sessionCount: number;
  dailyCap: number;
  sessionCap: number;
  lastAdAt: string | null;
  cooldownMs: number;
  lastWasRewarded: boolean;
  puzzlesSinceInterstitial: number;
  interstitialEvery: number;
  now?: Date;
}

export interface AdEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export interface AdShowResult {
  status: AdResultStatus;
  placement: AdPlacement;
  callbackId: string;
  rewardKey?: string;
}

export interface AdProviderAdapter {
  readonly name: string;
  isReady(placement: AdPlacement): Promise<boolean>;
  show(placement: AdPlacement): Promise<AdShowResult>;
}

/** Sandbox/test adapter for development and TestFlight until production approval. */
export class SandboxAdAdapter implements AdProviderAdapter {
  readonly name = "sandbox";
  private behavior: AdResultStatus = "completed";
  private seenCallbacks = new Set<string>();

  setBehavior(status: AdResultStatus) {
    this.behavior = status;
  }

  async isReady(): Promise<boolean> {
    return this.behavior !== "unavailable";
  }

  async show(placement: AdPlacement): Promise<AdShowResult> {
    const callbackId = `sandbox_${placement}_${Date.now()}`;
    if (this.behavior === "unavailable") {
      return { status: "unavailable", placement, callbackId };
    }
    if (this.behavior === "cancelled") {
      return { status: "cancelled", placement, callbackId };
    }
    if (this.behavior === "failed") {
      return { status: "failed", placement, callbackId };
    }
    if (this.behavior === "pending") {
      return { status: "pending", placement, callbackId };
    }
    return {
      status: "completed",
      placement,
      callbackId,
      rewardKey: `reward_${callbackId}`,
    };
  }

  /** Duplicate callback protection helper for tests. */
  claimCallback(callbackId: string): boolean {
    if (this.seenCallbacks.has(callbackId)) return false;
    this.seenCallbacks.add(callbackId);
    return true;
  }
}

export function evaluateAdEligibility(input: AdEligibilityInput): AdEligibilityResult {
  const now = input.now ?? new Date();

  if (input.placement.startsWith("interstitial") && input.hasAdRemoval) {
    return { eligible: false, reason: "ad_removal" };
  }
  if (!input.ageGatePassed) return { eligible: false, reason: "age_gate" };
  if (!input.consented && input.placement.startsWith("interstitial")) {
    return { eligible: false, reason: "consent" };
  }
  if (!input.platformAllowed) return { eligible: false, reason: "platform" };
  if (!input.regionAllowed) return { eligible: false, reason: "region" };
  if (input.dailyCount >= input.dailyCap) return { eligible: false, reason: "daily_cap" };
  if (input.sessionCount >= input.sessionCap) {
    return { eligible: false, reason: "session_cap" };
  }
  if (input.lastAdAt) {
    const elapsed = now.getTime() - new Date(input.lastAdAt).getTime();
    if (elapsed < input.cooldownMs) return { eligible: false, reason: "cooldown" };
  }
  if (input.placement.startsWith("interstitial")) {
    if (input.lastWasRewarded) {
      return { eligible: false, reason: "after_rewarded" };
    }
    if (input.puzzlesSinceInterstitial < input.interstitialEvery) {
      return { eligible: false, reason: "frequency" };
    }
  }
  return { eligible: true };
}

let activeAdapter: AdProviderAdapter = new SandboxAdAdapter();

export function getAdAdapter(): AdProviderAdapter {
  return activeAdapter;
}

export function setAdAdapter(adapter: AdProviderAdapter): void {
  activeAdapter = adapter;
}

/**
 * Provider decision (Phase 9 spike summary):
 * Do not ship a production ad SDK until Expo compatibility, ATT/consent,
 * and privacy labels are verified. Current default is SandboxAdAdapter.
 * Candidate adapters (document only): google-mobile-ads / react-native-google-mobile-ads
 * when Expo config-plugin support matches the pinned SDK; otherwise keep sandbox.
 */
export const AD_PROVIDER_DECISION = {
  status: "sandbox_default",
  productionProvider: null,
  rationale:
    "Compatibility and privacy spike deferred production SDK selection. Sandbox adapters power development and TestFlight until owner approval.",
  candidates: ["react-native-google-mobile-ads (evaluate against Expo SDK 57)"],
} as const;
