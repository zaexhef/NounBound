import {
  consumeHintToken,
  createDefaultHintInventory,
  formatCountdown,
  reconcileHints,
  remainingMs,
} from "../../src/features/timers/service";
import { defaultEconomyConfig } from "../../src/features/config/defaults";

describe("timers", () => {
  it("regenerates hints from absolute timestamps after reopen", () => {
    const config = defaultEconomyConfig;
    let inventory = createDefaultHintInventory(config);
    inventory = {
      tokenCount: 2,
      capacity: 3,
      nextHintAt: new Date(Date.now() - 1000).toISOString(),
    };
    inventory = reconcileHints(inventory, config, new Date());
    expect(inventory.tokenCount).toBe(3);
    expect(inventory.nextHintAt).toBeNull();
  });

  it("survives large backward clock changes without punitive expiry", () => {
    const now = new Date("2026-08-10T12:00:00Z");
    const inventory = {
      tokenCount: 1,
      capacity: 3,
      nextHintAt: new Date("2026-08-10T12:10:00Z").toISOString(),
    };
    const reconciled = reconcileHints(inventory, defaultEconomyConfig, now, {
      previousNowIso: "2026-08-10T18:00:00Z",
      maxBackwardSkewMs: 2 * 60 * 60 * 1000,
    });
    expect(reconciled.tokenCount).toBe(1);
    expect(reconciled.nextHintAt).toBeTruthy();
  });

  it("formats accessible countdowns", () => {
    expect(formatCountdown(65_000)).toContain("m");
    expect(remainingMs(new Date(Date.now() + 5000).toISOString())).toBeGreaterThan(0);
  });

  it("consumes tokens and starts regen when empty", () => {
    const inventory = createDefaultHintInventory(defaultEconomyConfig);
    const result = consumeHintToken(inventory, defaultEconomyConfig, new Date());
    expect(result.ok).toBe(true);
    expect(result.inventory.tokenCount).toBe(2);
  });
});
