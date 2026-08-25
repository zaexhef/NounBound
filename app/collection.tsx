import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { ACHIEVEMENTS } from "@/features/progression/service";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function CollectionScreen() {
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);
  const cleverPending = useAppStore((s) => s.cleverPending);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Collection"
        subtitle="Achievements, restored exhibits, and pending Clever Connections."
        world="celebrity"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = progress.achievements.includes(a.id);
            return (
              <View
                key={a.id}
                style={[styles.row, { opacity: unlocked ? 1 : 0.45 }]}
                accessibilityLabel={`${a.title}${unlocked ? ", unlocked" : ", locked"}`}
              >
                <Text style={styles.title}>{a.title}</Text>
                <Text style={styles.copy}>{a.description}</Text>
              </View>
            );
          })}
          <Text style={styles.section}>Clever Connections (local pending)</Text>
          {cleverPending.length === 0 ? (
            <Text style={styles.copy}>No pending submissions. Nothing is auto-applied to solutions.</Text>
          ) : (
            cleverPending.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.title}>{c.connection}</Text>
                <Text style={styles.copy}>
                  {c.words.join(" · ")} — {c.status} (not yet submitted)
                </Text>
              </View>
            ))
          )}
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.subtitle, color: colors.text },
  copy: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  section: { ...typography.label, color: colors.accent, marginTop: spacing.md },
});
