import { EconomyService } from "../../src/features/economy/service";
import { createMemoryEconomyStore } from "../../src/features/save/sqlite";

describe("economy ledger", () => {
  it("awards and spends with earned-before-purchased policy", async () => {
    const store = createMemoryEconomyStore();
    const economy = new EconomyService(store);
    await economy.awardCoins({
      idempotencyKey: "earn1",
      reason: "puzzle_complete_easy",
      amount: 10,
    });
    await economy.awardCoins({
      idempotencyKey: "buy1",
      reason: "purchase_coins",
      amount: 100,
      asPurchased: true,
    });
    const spend = await economy.spendCoins({
      idempotencyKey: "spend1",
      reason: "hint_regeneration",
      amount: 20,
    });
    expect(spend.ok).toBe(true);
    expect(spend.earnedCoinBalance).toBe(0);
    expect(spend.purchasedCoinBalance).toBe(90);
  });

  it("rejects insufficient balance and never goes negative", async () => {
    const economy = new EconomyService(createMemoryEconomyStore());
    const result = await economy.spendCoins({
      idempotencyKey: "spend_fail",
      reason: "hint_regeneration",
      amount: 5,
    });
    expect(result.ok).toBe(false);
    const balances = await economy.getBalances();
    expect(balances.usableBalance).toBe(0);
  });

  it("is idempotent on duplicate keys", async () => {
    const economy = new EconomyService(createMemoryEconomyStore());
    await economy.awardCoins({
      idempotencyKey: "dup",
      reason: "rewarded_ad",
      amount: 25,
    });
    const again = await economy.awardCoins({
      idempotencyKey: "dup",
      reason: "rewarded_ad",
      amount: 25,
    });
    expect(again.duplicate).toBe(true);
    expect(again.usableBalance).toBe(25);
  });

  it("reconciles ledger totals", async () => {
    const economy = new EconomyService(createMemoryEconomyStore());
    await economy.awardCoins({
      idempotencyKey: "a",
      reason: "daily_challenge",
      amount: 50,
    });
    await economy.spendCoins({
      idempotencyKey: "b",
      reason: "daily_chest_skip",
      amount: 20,
    });
    const reconciled = await economy.reconcileLedger();
    expect(reconciled.ok).toBe(true);
    expect(reconciled.earned).toBe(30);
  });
});
