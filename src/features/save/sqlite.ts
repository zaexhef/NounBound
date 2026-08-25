/**
 * SQLite-backed economy ledger and durable history.
 * Falls back to an in-memory/async adapter when native SQLite is unavailable (tests/web).
 */

export interface LedgerEntry {
  transactionId: string;
  idempotencyKey: string;
  reason: string;
  earnedDelta: number;
  purchasedDelta: number;
  resultingEarned: number;
  resultingPurchased: number;
  relatedPuzzleId?: string;
  relatedTimerId?: string;
  relatedAdId?: string;
  relatedPurchaseId?: string;
  createdAt: string;
  economyConfigVersion: number;
}

export interface EconomyBalances {
  earnedCoinBalance: number;
  purchasedCoinBalance: number;
}

export interface EconomyStore {
  getBalances(): Promise<EconomyBalances>;
  setBalances(balances: EconomyBalances): Promise<void>;
  findByIdempotencyKey(key: string): Promise<LedgerEntry | null>;
  appendEntry(entry: LedgerEntry): Promise<void>;
  listEntries(): Promise<LedgerEntry[]>;
}

class MemoryEconomyStore implements EconomyStore {
  private balances: EconomyBalances = {
    earnedCoinBalance: 0,
    purchasedCoinBalance: 0,
  };
  private entries: LedgerEntry[] = [];

  async getBalances() {
    return { ...this.balances };
  }

  async setBalances(balances: EconomyBalances) {
    this.balances = { ...balances };
  }

  async findByIdempotencyKey(key: string) {
    return this.entries.find((e) => e.idempotencyKey === key) ?? null;
  }

  async appendEntry(entry: LedgerEntry) {
    this.entries.push(entry);
  }

  async listEntries() {
    return [...this.entries];
  }
}

let store: EconomyStore = new MemoryEconomyStore();

export function getEconomyStore(): EconomyStore {
  return store;
}

export function setEconomyStoreForTests(next: EconomyStore): void {
  store = next;
}

export function createMemoryEconomyStore(): EconomyStore {
  return new MemoryEconomyStore();
}

/**
 * Attempt to open expo-sqlite. Safe no-op in Jest/web until native module is present.
 */
export async function initSqliteEconomyStore(): Promise<void> {
  try {
    // Dynamic import keeps tests from requiring native SQLite.
    const sqlite = await import("expo-sqlite");
    const db = await sqlite.openDatabaseAsync("nounbound_economy.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS economy_balances (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        earned INTEGER NOT NULL DEFAULT 0,
        purchased INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO economy_balances (id, earned, purchased) VALUES (1, 0, 0);
      CREATE TABLE IF NOT EXISTS economy_ledger (
        transaction_id TEXT PRIMARY KEY NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        reason TEXT NOT NULL,
        earned_delta INTEGER NOT NULL,
        purchased_delta INTEGER NOT NULL,
        resulting_earned INTEGER NOT NULL,
        resulting_purchased INTEGER NOT NULL,
        related_puzzle_id TEXT,
        related_timer_id TEXT,
        related_ad_id TEXT,
        related_purchase_id TEXT,
        created_at TEXT NOT NULL,
        economy_config_version INTEGER NOT NULL
      );
    `);

    store = {
      async getBalances() {
        const row = await db.getFirstAsync<{ earned: number; purchased: number }>(
          "SELECT earned, purchased FROM economy_balances WHERE id = 1",
        );
        return {
          earnedCoinBalance: row?.earned ?? 0,
          purchasedCoinBalance: row?.purchased ?? 0,
        };
      },
      async setBalances(balances) {
        await db.runAsync(
          "UPDATE economy_balances SET earned = ?, purchased = ? WHERE id = 1",
          balances.earnedCoinBalance,
          balances.purchasedCoinBalance,
        );
      },
      async findByIdempotencyKey(key) {
        const row = await db.getFirstAsync<Record<string, unknown>>(
          "SELECT * FROM economy_ledger WHERE idempotency_key = ?",
          key,
        );
        if (!row) return null;
        return mapRow(row);
      },
      async appendEntry(entry) {
        await db.runAsync(
          `INSERT INTO economy_ledger (
            transaction_id, idempotency_key, reason, earned_delta, purchased_delta,
            resulting_earned, resulting_purchased, related_puzzle_id, related_timer_id,
            related_ad_id, related_purchase_id, created_at, economy_config_version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          entry.transactionId,
          entry.idempotencyKey,
          entry.reason,
          entry.earnedDelta,
          entry.purchasedDelta,
          entry.resultingEarned,
          entry.resultingPurchased,
          entry.relatedPuzzleId ?? null,
          entry.relatedTimerId ?? null,
          entry.relatedAdId ?? null,
          entry.relatedPurchaseId ?? null,
          entry.createdAt,
          entry.economyConfigVersion,
        );
      },
      async listEntries() {
        const rows = await db.getAllAsync<Record<string, unknown>>(
          "SELECT * FROM economy_ledger ORDER BY created_at ASC",
        );
        return rows.map(mapRow);
      },
    };
  } catch {
    // Keep memory store for environments without SQLite.
    store = new MemoryEconomyStore();
  }
}

function mapRow(row: Record<string, unknown>): LedgerEntry {
  return {
    transactionId: String(row.transaction_id),
    idempotencyKey: String(row.idempotency_key),
    reason: String(row.reason),
    earnedDelta: Number(row.earned_delta),
    purchasedDelta: Number(row.purchased_delta),
    resultingEarned: Number(row.resulting_earned),
    resultingPurchased: Number(row.resulting_purchased),
    relatedPuzzleId: row.related_puzzle_id ? String(row.related_puzzle_id) : undefined,
    relatedTimerId: row.related_timer_id ? String(row.related_timer_id) : undefined,
    relatedAdId: row.related_ad_id ? String(row.related_ad_id) : undefined,
    relatedPurchaseId: row.related_purchase_id
      ? String(row.related_purchase_id)
      : undefined,
    createdAt: String(row.created_at),
    economyConfigVersion: Number(row.economy_config_version),
  };
}
