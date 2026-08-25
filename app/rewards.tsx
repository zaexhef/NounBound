import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { formatCountdown, reconcileHints, remainingMs } from "@/features/timers/service";
import { getAdAdapter, evaluateAdEligibility } from "@/features/ads/adapter";
import { countdownAccessibilityLabel } from "@/features/a11y/helpers";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function RewardsScreen() {
  const router = useRouter();
  const flags = useAppStore((s) => s.flags);
  const usableCoins = useAppStore((s) => s.usableCoins);
  const hintInventory = useAppStore((s) => s.hintInventory);
  const economyConfig = useAppStore((s) => s.economyConfig);
  const hasAdRemoval = useAppStore((s) => s.hasAdRemoval);
  const refreshEconomy = useAppStore((s) => s.refreshEconomy);
  const skipHint = useAppStore((s) => s.skipHintTimerWithCoins);
  const grantHintFromAd = useAppStore((s) => s.grantSandboxHintFromAd);
  const [message, setMessage] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    void refreshEconomy();
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [refreshEconomy]);

  const reconciled = reconcileHints(hintInventory, economyConfig);
  const countdown =
    reconciled.nextHintAt != null
      ? formatCountdown(remainingMs(reconciled.nextHintAt))
      : "Full";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Noun Coins & rewards"
        subtitle="Optional convenience only. The main journey never requires energy."
        world="history"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {!flags.economyEnabled ? (
            <Text style={styles.copy}>
              Economy systems are implemented behind feature flags and currently disabled for
              production. Enable ENABLE_ECONOMY in non-production builds to exercise sandbox flows.
            </Text>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.value}>{usableCoins}</Text>
                <Text style={styles.meta}>Usable Noun Coins</Text>
              </View>
              <View style={styles.panel}>
                <Text style={styles.meta}>
                  Hint tokens {reconciled.tokenCount}/{reconciled.capacity}
                </Text>
                <Text
                  style={styles.copy}
                  accessibilityLabel={countdownAccessibilityLabel("Hint regeneration", countdown)}
                >
                  Regen: {countdown}
                </Text>
              </View>
              <ArchiveButton
                label={`Skip hint timer (${economyConfig.sinks.hintRegeneration} coins)`}
                onPress={async () => {
                  const result = await skipHint();
                  setMessage(result.message);
                }}
              />
              {flags.rewardedAdsEnabled ? (
                <ArchiveButton
                  label="Watch rewarded ad for 1 hint"
                  variant="secondary"
                  onPress={async () => {
                    const eligibility = evaluateAdEligibility({
                      placement: "rewarded_hint",
                      hasAdRemoval,
                      consented: true,
                      ageGatePassed: true,
                      platformAllowed: true,
                      regionAllowed: true,
                      dailyCount: 0,
                      sessionCount: 0,
                      dailyCap: economyConfig.ads.dailyCap,
                      sessionCap: economyConfig.ads.sessionCap,
                      lastAdAt: null,
                      cooldownMs: economyConfig.ads.cooldownMs,
                      lastWasRewarded: false,
                      puzzlesSinceInterstitial: 0,
                      interstitialEvery: economyConfig.ads.interstitialEveryMin,
                    });
                    if (!eligibility.eligible) {
                      setMessage(`Ad unavailable: ${eligibility.reason}. Free timer still runs.`);
                      return;
                    }
                    const result = await getAdAdapter().show("rewarded_hint");
                    if (result.status === "completed") {
                      await grantHintFromAd();
                      setMessage("Hint token granted from rewarded ad.");
                    } else {
                      setMessage(`Ad ${result.status}. Progress is not blocked.`);
                    }
                  }}
                />
              ) : (
                <Text style={styles.copy}>
                  Rewarded ads use sandbox adapters and remain disabled until owner approval.
                </Text>
              )}
            </>
          )}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <ArchiveButton
            label="Purchase restoration"
            variant="secondary"
            onPress={() => router.push("/restore")}
          />
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxxl },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  value: { ...typography.hero, color: colors.accent },
  meta: { ...typography.caption, color: colors.textMuted },
  copy: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  message: { ...typography.bodyStrong, color: colors.warning },
});
