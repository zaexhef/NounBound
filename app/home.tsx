import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function HomeScreen() {
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);
  const usableCoins = useAppStore((s) => s.usableCoins);
  const flags = useAppStore((s) => s.flags);
  const board = useAppStore((s) => s.board);
  const resume = useAppStore((s) => s.resumeActivePuzzle);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        brand
        title="Living Archive"
        subtitle="Every noun belongs somewhere. Find the connection."
        world="history"
        rightSlot={
          flags.economyEnabled ? (
            <View style={styles.coinChip} accessibilityLabel={`${usableCoins} Noun Coins`}>
              <Text style={styles.coinText}>{usableCoins}</Text>
            </View>
          ) : null
        }
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.meta}>
            Level {progress.playerLevel} · {progress.insightPoints} Insight · Streak{" "}
            {progress.stats.currentStreak}
          </Text>
          {board?.status === "playing" ? (
            <ArchiveButton
              label="Resume active puzzle"
              onPress={async () => {
                const ok = await resume();
                if (ok) router.push({ pathname: "/puzzle/[id]", params: { id: board.puzzleId } });
              }}
            />
          ) : null}
          <ArchiveButton label="Journey Map" onPress={() => router.push("/journey")} />
          <ArchiveButton
            label="Puzzle selection"
            variant="secondary"
            onPress={() => router.push("/worlds")}
          />
          <ArchiveButton
            label="Daily Mystery"
            variant="secondary"
            onPress={() => router.push("/daily")}
          />
          <ArchiveButton
            label="Collection & achievements"
            variant="secondary"
            onPress={() => router.push("/collection")}
          />
          <ArchiveButton
            label="Statistics"
            variant="secondary"
            onPress={() => router.push("/stats")}
          />
          <ArchiveButton
            label="Noun Coins & rewards"
            variant="secondary"
            onPress={() => router.push("/rewards")}
          />
          <ArchiveButton
            label="Cosmetics"
            variant="secondary"
            onPress={() => router.push("/cosmetics")}
          />
          <ArchiveButton
            label="Settings & accessibility"
            variant="ghost"
            onPress={() => router.push("/settings")}
          />
          <ArchiveButton
            label="Privacy & support"
            variant="ghost"
            onPress={() => router.push("/legal")}
          />
          {flags.diagnosticsEnabled ? (
            <ArchiveButton
              label="Diagnostics (dev)"
              variant="ghost"
              onPress={() => router.push("/diagnostics")}
            />
          ) : null}
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxxl },
  meta: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  coinChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  coinText: { ...typography.bodyStrong, color: colors.accent },
});
