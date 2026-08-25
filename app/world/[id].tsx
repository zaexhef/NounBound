import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { getWorld, isNodeUnlocked } from "@/features/journey/worlds";
import { colors, spacing, typography, WorldId } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function WorldScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const world = getWorld(id as WorldId);
  const completed =
    useAppStore((s) => s.progress.worldProgress[id ?? ""]?.completedNodeIds) ?? [];
  const completeJourneyNode = useAppStore((s) => s.completeJourneyNode);

  if (!world) {
    return (
      <SafeAreaView style={styles.safe}>
        <ArchiveScreen title="World not found">
          <ArchiveButton label="Back" onPress={() => router.back()} />
        </ArchiveScreen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title={world.name}
        subtitle={world.tagline}
        world={world.id as WorldId}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {world.nodes.map((node) => {
            const unlocked = isNodeUnlocked(node, completed);
            const done = completed.includes(node.id);
            return (
              <Pressable
                key={node.id}
                disabled={
                  !unlocked ||
                  (!node.puzzleId &&
                    node.type !== "restoration" &&
                    node.type !== "connection")
                }
                accessibilityState={{ disabled: !unlocked }}
                accessibilityLabel={`${node.title}, ${node.type}${done ? ", completed" : ""}`}
                onPress={async () => {
                  if (node.type === "connection" && node.connectsToWorld) {
                    await completeJourneyNode(world.id, node.id);
                    router.push({
                      pathname: "/world/[id]",
                      params: { id: node.connectsToWorld },
                    });
                    return;
                  }
                  if (node.type === "restoration") {
                    await completeJourneyNode(world.id, node.id);
                    router.push({
                      pathname: "/chain",
                      params: {
                        from: node.id,
                        noun: "Restoration",
                        toWorld: world.nextWorld ?? "",
                        worldId: world.id,
                        nodeId: node.id,
                      },
                    });
                    return;
                  }
                  if (node.puzzleId) {
                    router.push({
                      pathname: "/puzzle/[id]",
                      params: {
                        id: node.puzzleId,
                        worldId: world.id,
                        nodeId: node.id,
                      },
                    });
                  }
                }}
                style={[
                  styles.node,
                  {
                    opacity: unlocked ? 1 : 0.4,
                    borderColor: done ? colors.success : colors.borderStrong,
                  },
                ]}
              >
                <Text style={styles.type}>{node.type.replace("_", " ")}</Text>
                <Text style={styles.title}>{node.title}</Text>
                {node.puzzleId ? (
                  <Text style={styles.meta}>Puzzle {node.puzzleId}</Text>
                ) : null}
              </Pressable>
            );
          })}
          <ArchiveButton label="Back to map" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  node: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 44,
  },
  type: { ...typography.label, color: colors.accent },
  title: { ...typography.subtitle, color: colors.text, marginTop: 4 },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
