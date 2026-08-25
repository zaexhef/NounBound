import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function StatsScreen() {
  const router = useRouter();
  const stats = useAppStore((s) => s.progress.stats);
  const insight = useAppStore((s) => s.progress.insightPoints);
  const level = useAppStore((s) => s.progress.playerLevel);

  const rows = [
    ["Player level", String(level)],
    ["Insight Points", String(insight)],
    ["Solves", String(stats.solves)],
    ["Losses", String(stats.losses)],
    ["Hints used", String(stats.hintsUsed)],
    ["Perfect boards", String(stats.perfectBoards)],
    ["Current streak", String(stats.currentStreak)],
    ["Best streak", String(stats.bestStreak)],
    ["Streak protections", String(stats.streakProtections)],
    ["Longest chain", String(stats.longestChain)],
    ["Play time (min)", String(Math.round(stats.totalPlayTimeMs / 60000))],
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen title="Statistics" subtitle="Personal mastery — time never reduces normal-mode score.">
        <View style={styles.panel}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
        <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: 44,
    alignItems: "center",
  },
  label: { ...typography.body, color: colors.textMuted },
  value: { ...typography.bodyStrong, color: colors.text },
});
