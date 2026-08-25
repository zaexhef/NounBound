import {
  evaluateAdEligibility,
  SandboxAdAdapter,
} from "../../src/features/ads/adapter";
import {
  SandboxPurchaseAdapter,
} from "../../src/features/purchases/adapter";

describe("ads and purchases adapters", () => {
  it("suppresses interstitials for ad-removal owners", () => {
    const result = evaluateAdEligibility({
      placement: "interstitial_results",
      hasAdRemoval: true,
      consented: true,
      ageGatePassed: true,
      platformAllowed: true,
      regionAllowed: true,
      dailyCount: 0,
      sessionCount: 0,
      dailyCap: 8,
      sessionCap: 4,
      lastAdAt: null,
      cooldownMs: 0,
      lastWasRewarded: false,
      puzzlesSinceInterstitial: 10,
      interstitialEvery: 4,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("ad_removal");
  });

  it("handles unavailable/cancelled/completed ad outcomes", async () => {
    const adapter = new SandboxAdAdapter();
    adapter.setBehavior("unavailable");
    expect((await adapter.show("rewarded_coins")).status).toBe("unavailable");
    adapter.setBehavior("cancelled");
    expect((await adapter.show("rewarded_coins")).status).toBe("cancelled");
    adapter.setBehavior("completed");
    const done = await adapter.show("rewarded_coins");
    expect(done.status).toBe("completed");
    expect(adapter.claimCallback(done.callbackId)).toBe(true);
    expect(adapter.claimCallback(done.callbackId)).toBe(false);
  });

  it("supports purchase cancel, pending, complete, restore, revoke", async () => {
    const adapter = new SandboxPurchaseAdapter();
    adapter.setBehavior("cancelled");
    expect((await adapter.purchase("coins_250")).status).toBe("cancelled");
    adapter.setBehavior("pending");
    expect((await adapter.purchase("coins_250")).status).toBe("pending");
    adapter.setBehavior("completed");
    const bought = await adapter.purchase("ad_removal");
    expect(bought.status).toBe("completed");
    const restored = await adapter.restore();
    expect(restored.some((r) => r.productId === "ad_removal")).toBe(true);
    adapter.revoke("ad_removal");
    expect(await adapter.restore()).toHaveLength(0);
  });
});
