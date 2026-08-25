import { defaultEconomyConfig, EconomyConfig } from "../config/defaults";

export type TimerPurpose =
  | "hint_regen"
  | "daily_chest"
  | "second_chance"
  | "challenge_pack"
  | "exhibit_restoration";

export interface TimedBenefit {
  id: string;
  purpose: TimerPurpose;
  startsAt: string;
  endsAt: string;
  status: "active" | "completed" | "claimed";
}

export interface HintInventory {
  tokenCount: number;
  capacity: number;
  nextHintAt: string | null;
}

export interface TimerSnapshot {
  hints: HintInventory;
  benefits: TimedBenefit[];
  lastReconciledAt: string;
}

export function createDefaultHintInventory(
  config: EconomyConfig = defaultEconomyConfig,
): HintInventory {
  return {
    tokenCount: config.hints.capacity,
    capacity: config.hints.capacity,
    nextHintAt: null,
  };
}

export function remainingMs(endsAt: string, now = new Date()): number {
  return Math.max(0, new Date(endsAt).getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Reconcile hint regeneration using absolute end timestamps.
 * Large backward clock changes do not punish the player — if the computed
 * remaining time jumps unreasonably, keep inventory and clear punitive expiry.
 */
export function reconcileHints(
  inventory: HintInventory,
  config: EconomyConfig,
  now = new Date(),
  options?: { previousNowIso?: string; maxBackwardSkewMs?: number },
): HintInventory {
  const maxSkew = options?.maxBackwardSkewMs ?? 2 * 60 * 60 * 1000;
  if (options?.previousNowIso) {
    const prev = new Date(options.previousNowIso).getTime();
    const delta = now.getTime() - prev;
    if (delta < -maxSkew) {
      // Clock moved far backward: do not expire tokens; pause regen stamp.
      return {
        ...inventory,
        nextHintAt:
          inventory.tokenCount >= inventory.capacity
            ? null
            : inventory.nextHintAt,
      };
    }
  }

  let tokenCount = inventory.tokenCount;
  let nextHintAt = inventory.nextHintAt;

  if (tokenCount >= inventory.capacity) {
    return { ...inventory, tokenCount: inventory.capacity, nextHintAt: null };
  }

  if (!nextHintAt) {
    nextHintAt = new Date(now.getTime() + config.hints.regenMs).toISOString();
    return { ...inventory, nextHintAt };
  }

  while (tokenCount < inventory.capacity && nextHintAt) {
    const end = new Date(nextHintAt).getTime();
    if (now.getTime() < end) break;
    tokenCount += 1;
    if (tokenCount >= inventory.capacity) {
      nextHintAt = null;
      break;
    }
    nextHintAt = new Date(end + config.hints.regenMs).toISOString();
  }

  return {
    tokenCount,
    capacity: inventory.capacity,
    nextHintAt,
  };
}

export function consumeHintToken(inventory: HintInventory, config: EconomyConfig, now = new Date()): {
  ok: boolean;
  inventory: HintInventory;
} {
  const reconciled = reconcileHints(inventory, config, now);
  if (reconciled.tokenCount <= 0) {
    return { ok: false, inventory: reconciled };
  }
  const tokenCount = reconciled.tokenCount - 1;
  const nextHintAt =
    tokenCount >= reconciled.capacity
      ? null
      : reconciled.nextHintAt ??
        new Date(now.getTime() + config.hints.regenMs).toISOString();
  return {
    ok: true,
    inventory: {
      tokenCount,
      capacity: reconciled.capacity,
      nextHintAt,
    },
  };
}

export function grantHintToken(inventory: HintInventory): HintInventory {
  const tokenCount = Math.min(inventory.capacity, inventory.tokenCount + 1);
  return {
    ...inventory,
    tokenCount,
    nextHintAt: tokenCount >= inventory.capacity ? null : inventory.nextHintAt,
  };
}

export function completeTimerEarly(benefit: TimedBenefit, now = new Date()): TimedBenefit {
  return {
    ...benefit,
    endsAt: now.toISOString(),
    status: "completed",
  };
}

export function createTimedBenefit(
  purpose: TimerPurpose,
  durationMs: number,
  now = new Date(),
): TimedBenefit {
  return {
    id: `${purpose}_${now.getTime()}`,
    purpose,
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + durationMs).toISOString(),
    status: "active",
  };
}

export function reconcileBenefits(
  benefits: TimedBenefit[],
  now = new Date(),
): TimedBenefit[] {
  return benefits.map((b) => {
    if (b.status !== "active") return b;
    if (remainingMs(b.endsAt, now) <= 0) {
      return { ...b, status: "completed" };
    }
    return b;
  });
}
