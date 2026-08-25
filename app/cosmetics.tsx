import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";
import { saveProgress } from "@/features/save/persistence";

export default function CosmeticsScreen() {
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);

  async function equip(kind: "card" | "theme" | "title", value: string) {
    const cosmetics = { ...progress.cosmetics };
    if (kind === "card") cosmetics.equippedCardBack = value;
    if (kind === "theme") cosmetics.equippedBoardTheme = value;
    if (kind === "title") cosmetics.equippedTitle = value;
    const next = { ...progress, cosmetics };
    useAppStore.setState({ progress: next });
    await saveProgress(next);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Cosmetic collection"
        subtitle="Expression only — never competitive power."
        world="celebrity"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.section}>Card backs</Text>
          {progress.cosmetics.unlockedCardBacks.map((id) => (
            <Pressable
              key={id}
              style={styles.row}
              onPress={() => void equip("card", id)}
              accessibilityLabel={`Card back ${id}${progress.cosmetics.equippedCardBack === id ? ", equipped" : ""}`}
            >
              <Text style={styles.title}>{id}</Text>
              <Text style={styles.meta}>
                {progress.cosmetics.equippedCardBack === id ? "Equipped" : "Tap to equip"}
              </Text>
            </Pressable>
          ))}
          <Text style={styles.section}>Board themes</Text>
          {progress.cosmetics.unlockedBoardThemes.map((id) => (
            <Pressable key={id} style={styles.row} onPress={() => void equip("theme", id)}>
              <Text style={styles.title}>{id}</Text>
            </Pressable>
          ))}
          <Text style={styles.section}>Profile titles</Text>
          {progress.cosmetics.unlockedTitles.map((id) => (
            <Pressable key={id} style={styles.row} onPress={() => void equip("title", id)}>
              <Text style={styles.title}>{id}</Text>
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
  section: { ...typography.label, color: colors.accent, marginTop: spacing.md },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  title: { ...typography.subtitle, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
});
