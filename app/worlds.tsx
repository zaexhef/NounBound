import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { getPlayablePuzzles } from "@/features/content/loader";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function WorldsSelectScreen() {
  const router = useRouter();
  const stars = useAppStore((s) => s.progress.puzzleStars);
  const puzzles = getPlayablePuzzles();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Puzzle selection"
        subtitle="Bundled prototype boards — honest development editorial status."
        world="objects"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {puzzles.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`${p.title}, ${p.difficulty}, ${p.mode}`}
              onPress={() => router.push({ pathname: "/puzzle/[id]", params: { id: p.id } })}
              style={styles.row}
            >
              <Text style={styles.title}>{p.title}</Text>
              <Text style={styles.meta}>
                {p.difficulty} · {p.mode.replace("_", " ")} · {p.world} · ★{stars[p.id] ?? 0} ·{" "}
                {p.editorial.status}
              </Text>
            </Pressable>
          ))}
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 44,
  },
  title: { ...typography.subtitle, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
