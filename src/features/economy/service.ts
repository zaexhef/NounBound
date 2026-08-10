import { Difficulty } from "../content/schema";
import { EconomyConfig, defaultEconomyConfig } from "../config/defaults";
import {
  EconomyStore,
  getEconomyStore,
  LedgerEntry,
} from "../save/sqlite";

export type CoinReason =
  | "puzzle_complete_easy"
  | "puzzle_complete_normal"
  | "puzzle_complete_hard"
  | "puzzle_complete_expert"
  | "puzzle_complete_tutorial"
  | "perfect_bonus"
  | "first_puzzle_of_day"
  | "daily_challenge"
  | "seven_day_streak"
  | "world_completion"
  | "rewarded_ad"
  | "purchase_coins"
  | "hint_regeneration"
  | "daily_chest_skip"
  | "second_chance_skip"
  | "challenge_pack_skip"
  | "exhibit_restoration_skip"
  | "refund_adjustment"
  | "migration_zero";

export interface EconomyOperationResult {
  ok: boolean;
  duplicate: boolean;
  entry?: LedgerEntry;
  error?: string;
  usableBalance: number;
  earnedCoinBalance: number;
  purchasedCoinBalance: number;
}

function usable(earned: number, purchased: number): number {
  return earned + purchased;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function rewardForDifficulty(
  difficulty: Difficulty,
  config: EconomyConfig = defaultEconomyConfig,
): number {
  switch (difficulty) {
    case "easy":
      return config.rewards.easy;
    case "normal":
      return config.rewards.normal;
    case "hard":
      return config.rewards.hard;
    case "expert":
      return config.rewards.expert;
    case "tutorial":
      return config.rewards.tutorial;
    default:
      return 0;
  }
}

export class EconomyService {
  constructor(
    private store: EconomyStore = getEconomyStore(),
    private config: EconomyConfig = defaultEconomyConfig,
  ) {}

  setConfig(config: EconomyConfig) {
    this.config = config;
  }

  async getBalances() {
    const b = await this.store.getBalances();
    return {
      ...b,
      usableBalance: usable(b.earnedCoinBalance, b.purchasedCoinBalance),
    };
  }

  async awardCoins(input: {
    idempotencyKey: string;
    reason: CoinReason;
    amount: number;
    relatedPuzzleId?: string;
    relatedAdId?: string;
    relatedPurchaseId?: string;
    asPurchased?: boolean;
  }): Promise<EconomyOperationResult> {
    const existing = await this.store.findByIdempotencyKey(input.idempotencyKey);
    const balances = await this.store.getBalances();
    if (existing) {
      return {
        ok: true,
        duplicate: true,
        entry: existing,
        usableBalance: usable(balances.earnedCoinBalance, balances.purchasedCoinBalance),
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }

    if (input.amount < 0) {
      return {
        ok: false,
        duplicate: false,
        error: "Award amount cannot be negative",
        usableBalance: usable(balances.earnedCoinBalance, balances.purchasedCoinBalance),
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }

    const earnedDelta = input.asPurchased ? 0 : input.amount;
    const purchasedDelta = input.asPurchased ? input.amount : 0;
    const resultingEarned = balances.earnedCoinBalance + earnedDelta;
    const resultingPurchased = balances.purchasedCoinBalance + purchasedDelta;

    const entry: LedgerEntry = {
      transactionId: newId("txn"),
      idempotencyKey: input.idempotencyKey,
      reason: input.reason,
      earnedDelta,
      purchasedDelta,
      resultingEarned,
      resultingPurchased,
      relatedPuzzleId: input.relatedPuzzleId,
      relatedAdId: input.relatedAdId,
      relatedPurchaseId: input.relatedPurchaseId,
      createdAt: new Date().toISOString(),
      economyConfigVersion: this.config.version,
    };

    await this.store.appendEntry(entry);
    await this.store.setBalances({
      earnedCoinBalance: resultingEarned,
      purchasedCoinBalance: resultingPurchased,
    });

    return {
      ok: true,
      duplicate: false,
      entry,
      usableBalance: usable(resultingEarned, resultingPurchased),
      earnedCoinBalance: resultingEarned,
      purchasedCoinBalance: resultingPurchased,
    };
  }

  /**
   * Spend earned coins before purchased coins unless legally required otherwise.
   */
  async spendCoins(input: {
    idempotencyKey: string;
    reason: CoinReason;
    amount: number;
    relatedPuzzleId?: string;
    relatedTimerId?: string;
  }): Promise<EconomyOperationResult> {
    const existing = await this.store.findByIdempotencyKey(input.idempotencyKey);
    const balances = await this.store.getBalances();
    if (existing) {
      return {
        ok: true,
        duplicate: true,
        entry: existing,
        usableBalance: usable(balances.earnedCoinBalance, balances.purchasedCoinBalance),
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }

    const total = usable(balances.earnedCoinBalance, balances.purchasedCoinBalance);
    if (input.amount < 0) {
      return {
        ok: false,
        duplicate: false,
        error: "Spend amount cannot be negative",
        usableBalance: total,
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }
    if (input.amount > total) {
      return {
        ok: false,
        duplicate: false,
        error: "Insufficient balance",
        usableBalance: total,
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }

    const fromEarned = Math.min(balances.earnedCoinBalance, input.amount);
    const fromPurchased = input.amount - fromEarned;
    const resultingEarned = balances.earnedCoinBalance - fromEarned;
    const resultingPurchased = balances.purchasedCoinBalance - fromPurchased;

    if (resultingEarned < 0 || resultingPurchased < 0) {
      return {
        ok: false,
        duplicate: false,
        error: "Balance would become negative",
        usableBalance: total,
        earnedCoinBalance: balances.earnedCoinBalance,
        purchasedCoinBalance: balances.purchasedCoinBalance,
      };
    }

    const entry: LedgerEntry = {
      transactionId: newId("txn"),
      idempotencyKey: input.idempotencyKey,
      reason: input.reason,
      earnedDelta: -fromEarned,
      purchasedDelta: -fromPurchased,
      resultingEarned,
      resultingPurchased,
      relatedPuzzleId: input.relatedPuzzleId,
      relatedTimerId: input.relatedTimerId,
      createdAt: new Date().toISOString(),
      economyConfigVersion: this.config.version,
    };

    await this.store.appendEntry(entry);
    await this.store.setBalances({
      earnedCoinBalance: resultingEarned,
      purchasedCoinBalance: resultingPurchased,
    });

    return {
      ok: true,
      duplicate: false,
      entry,
      usableBalance: usable(resultingEarned, resultingPurchased),
      earnedCoinBalance: resultingEarned,
      purchasedCoinBalance: resultingPurchased,
    };
  }

  async reconcileLedger(): Promise<{
    ok: boolean;
    earned: number;
    purchased: number;
  }> {
    const entries = await this.store.listEntries();
    let earned = 0;
    let purchased = 0;
    for (const e of entries) {
      earned += e.earnedDelta;
      purchased += e.purchasedDelta;
    }
    if (earned < 0 || purchased < 0) {
      return { ok: false, earned, purchased };
    }
    await this.store.setBalances({
      earnedCoinBalance: earned,
      purchasedCoinBalance: purchased,
    });
    return { ok: true, earned, purchased };
  }
}

export const economyService = new EconomyService();
