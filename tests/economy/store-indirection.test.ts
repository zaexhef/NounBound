import { EconomyService } from "../../src/features/economy/service";
import {
  createMemoryEconomyStore,
  setEconomyStoreForTests,
} from "../../src/features/save/sqlite";

describe("economy store indirection", () => {
  it("uses the active store after setEconomyStoreForTests", async () => {
    const first = createMemoryEconomyStore();
    setEconomyStoreForTests(first);
    const economy = new EconomyService();
    await economy.awardCoins({
      idempotencyKey: "a1",
      reason: "puzzle_complete_easy",
      amount: 10,
    });

    const second = createMemoryEconomyStore();
    setEconomyStoreForTests(second);
    const balancesOnSecond = await economy.getBalances();
    expect(balancesOnSecond.usableBalance).toBe(0);

    await economy.awardCoins({
      idempotencyKey: "a2",
      reason: "puzzle_complete_normal",
      amount: 15,
    });
    expect((await economy.getBalances()).usableBalance).toBe(15);
    expect((await first.getBalances()).earnedCoinBalance).toBe(10);
  });
});
