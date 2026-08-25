import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { getPuzzleById } from "@/features/content/loader";
import { useAppStore } from "@/store/appStore";
import { colors, spacing, typography } from "@/theme";

export default function ResultsScreen() {
  const { id, status } = useLocalSearchParams<{ id: string; status: string }>();
  const router = useRouter();
  const puzzle = getPuzzleById(id ?? "");
  const board = useAppStore((s) => s.board);
  const breakdown = useAppStore((s) => s.lastScoreBreakdown);
  const resetBoard = useAppStore((s) => s.resetBoard);
  const submitClever = useAppStore((s) => s.submitCleverConnection);

  if (!puzzle) {
    return (
      <SafeAreaView style={styles.safe}>
        <ArchiveScreen title="Results unavailable">
          <ArchiveButton label="Home" onPress={() => router.replace("/home")} />
        </ArchiveScreen>
      </SafeAreaView>
    );
  }

  const won = status === "won";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title={won ? "Archive restored" : "Solution revealed"}
        subtitle={puzzle.title}
        world={puzzle.world}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {won && breakdown ? (
            <View style={styles.panel}>
              <Text style={styles.score}>{breakdown.total} Insight</Text>
              <Text style={styles.meta}>Stars: {"★".repeat(breakdown.stars)}</Text>
              <Text style={styles.meta}>Base {breakdown.base}</Text>
              <Text style={styles.meta}>No mistakes +{breakdown.noMistakes}</Text>
              <Text style={styles.meta}>No hints +{breakdown.noHints}</Text>
              <Text style={styles.meta}>Named categories +{breakdown.namedCategories}</Text>
              {breakdown.collisionBonus ? (
                <Text style={styles.meta}>Category Collision +{breakdown.collisionBonus}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.copy}>
              Three incorrect submissions end the board. Review the intended groups, then replay
              without energy cost.
            </Text>
          )}

          {puzzle.groups.map((g) => (
            <View key={g.id} style={styles.group}>
              <Text style={styles.groupTitle}>{g.connection}</Text>
              <Text style={styles.meta}>{g.words.join(" · ")}</Text>
              <Text style={styles.copy}>{g.explanation}</Text>
            </View>
          ))}

          {puzzle.completionFact ? (
            <View style={styles.panel}>
              <Text style={styles.groupTitle}>Completion fact</Text>
              <Text style={styles.copy}>{puzzle.completionFact}</Text>
            </View>
          ) : null}

          {puzzle.mode === "category_collision" ? (
            <View style={styles.panel}>
              <Text style={styles.groupTitle}>Category Collision</Text>
              <Text style={styles.copy}>
                This board crosses subject areas on purpose. The intended partition remains the
                only completion path.
              </Text>
            </View>
          ) : null}

          {won && puzzle.chainNextPuzzleId && puzzle.chainRevealNoun ? (
            <ArchiveButton
              label={`Follow chain: ${puzzle.chainRevealNoun}`}
              onPress={() =>
                router.push({
                  pathname: "/chain",
                  params: {
                    noun: puzzle.chainRevealNoun!,
                    to: puzzle.chainNextPuzzleId!,
                    from: puzzle.id,
                  },
                })
              }
            />
          ) : null}

          <ArchiveButton
            label="Record Clever Connection"
            variant="secondary"
            onPress={async () => {
              // Prefer a solved group as a legitimate alternate candidate seed.
              const words =
                board?.solvedGroups[0]?.words ?? puzzle.groups[0]!.words;
              await submitClever({
                words,
                connection: "Player alternate",
                note: "Stored locally as pending — not yet submitted to a backend.",
              });
            }}
          />
          <ArchiveButton
            label="Replay"
            variant="secondary"
            onPress={async () => {
              await resetBoard();
              router.replace({ pathname: "/puzzle/[id]", params: { id: puzzle.id } });
            }}
          />
          <ArchiveButton label="Home" variant="ghost" onPress={() => router.replace("/home")} />
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
    borderColor: colors.borderStrong,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  score: { ...typography.hero, color: colors.accent },
  meta: { ...typography.caption, color: colors.textMuted },
  copy: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  group: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
    gap: 4,
  },
  groupTitle: { ...typography.subtitle, color: colors.text },
});
