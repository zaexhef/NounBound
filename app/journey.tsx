import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { journeyWorlds } from "@/features/journey/worlds";
import { colors, spacing, typography, worldThemes } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function JourneyMapScreen() {
  const router = useRouter();
  const worldProgress = useAppStore((s) => s.progress.worldProgress);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Journey Map"
        subtitle="Restore four archive wings through Connection Chains."
        world="crossover"
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {journeyWorlds.map((world) => {
            const theme = worldThemes[world.id];
            const progress = worldProgress[world.id];
            return (
              <Pressable
                key={world.id}
                accessibilityRole="button"
                accessibilityLabel={`${world.name}. ${progress?.completedNodeIds.length ?? 0} nodes restored.`}
                onPress={() =>
                  router.push({ pathname: "/world/[id]", params: { id: world.id } })
                }
                style={[styles.world, { borderColor: theme.accent, backgroundColor: theme.surface }]}
              >
                <Text style={styles.name}>{world.name}</Text>
                <Text style={styles.tag}>{world.tagline}</Text>
                <Text style={styles.meta}>
                  Nodes {progress?.completedNodeIds.length ?? 0}/{world.nodes.length}
                  {progress?.finaleComplete ? " · Finale complete" : ""}
                </Text>
              </Pressable>
            );
          })}
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxxl },
  world: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    minHeight: 44,
  },
  name: { ...typography.title, color: colors.text },
  tag: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.accent, marginTop: spacing.sm },
});
