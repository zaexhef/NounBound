import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { getDailyFallbackPuzzle, getDailyMysteryPuzzle } from "@/features/content/loader";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function DailyMysteryScreen() {
  const router = useRouter();
  const daily = useAppStore((s) => s.progress.daily);

  const { puzzle, usedFallback } = useMemo(() => {
    try {
      // Local deterministic daily — no network required.
      const p = getDailyMysteryPuzzle();
      return { puzzle: p, usedFallback: false };
    } catch {
      return { puzzle: getDailyFallbackPuzzle(), usedFallback: true };
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Daily Mystery"
        subtitle="Offline-safe. Service failure never destroys your streak."
        world="crossover"
      >
        <View style={styles.panel}>
          <Text style={styles.title}>{puzzle.title}</Text>
          <Text style={styles.meta}>
            {puzzle.difficulty} · {puzzle.world}
            {usedFallback ? " · Bundled reserve fallback" : " · Local daily rotation"}
          </Text>
          <Text style={styles.copy}>
            Last completed day: {daily.lastCompletedDay ?? "none"}
          </Text>
        </View>
        <ArchiveButton
          label="Play Daily Mystery"
          onPress={() =>
            router.push({ pathname: "/puzzle/[id]", params: { id: puzzle.id } })
          }
        />
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
    borderColor: colors.borderStrong,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.caption, color: colors.accent },
  copy: { ...typography.body, color: colors.textMuted },
});
