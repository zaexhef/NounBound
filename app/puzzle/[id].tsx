import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArchiveButton } from "@/components/ArchiveButton";
import { NounCard } from "@/components/NounCard";
import { SolvedGroupBand } from "@/components/SolvedGroupBand";
import { getActiveWords } from "@/features/game/engine";
import { mistakesAccessibilityLabel } from "@/features/a11y/helpers";
import { useAppStore } from "@/store/appStore";
import { colors, spacing, typography, worldThemes, WorldId } from "@/theme";

export default function PuzzleBoardScreen() {
  const { id, worldId, nodeId, isDaily, usedFallback } = useLocalSearchParams<{
    id: string;
    worldId?: string;
    nodeId?: string;
    isDaily?: string;
    usedFallback?: string;
  }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const board = useAppStore((s) => s.board);
  const puzzle = useAppStore((s) => s.activePuzzle);
  const settings = useAppStore((s) => s.settings);
  const startPuzzle = useAppStore((s) => s.startPuzzle);
  const toggle = useAppStore((s) => s.toggleCard);
  const clear = useAppStore((s) => s.clearSelection);
  const submit = useAppStore((s) => s.submit);
  const hint = useAppStore((s) => s.hint);
  const tick = useAppStore((s) => s.tick);
  const canSubmitSelection = useAppStore((s) => s.canSubmit);

  useEffect(() => {
    if (!id) return;
    // Only start when missing or for a different puzzle. Never restart won/lost boards.
    if (!board || board.puzzleId !== id) {
      void startPuzzle(id, {
        worldId,
        nodeId,
        isDaily: isDaily === "1",
        usedDailyFallback: usedFallback === "1",
      });
    }
    // Intentionally depend on puzzle id, not full board object (avoids win/loss restart loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, worldId, nodeId, isDaily, usedFallback, board?.puzzleId, startPuzzle]);

  useEffect(() => {
    const timer = setInterval(() => tick(1000), 1000);
    return () => clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    if (!board || board.puzzleId !== id) return;
    if (board.status === "won" || board.status === "lost") {
      router.replace({
        pathname: "/results",
        params: { id: board.puzzleId, status: board.status },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.status, board?.puzzleId, id, router]);

  if (!board || !puzzle) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Opening archive drawer…</Text>
      </SafeAreaView>
    );
  }

  const world = (worldId as WorldId) || puzzle.world;
  const theme = worldThemes[world] ?? worldThemes.history;
  const activeWords = getActiveWords(board);
  const isCollision = puzzle.mode === "category_collision";
  const narrow = width < 360;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.gradient[0] }]} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <Text style={styles.kicker}>{theme.name}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {puzzle.title}
        </Text>
        <Text
          style={styles.meta}
          accessibilityLabel={mistakesAccessibilityLabel(board.mistakesRemaining)}
        >
          Mistakes {board.mistakesRemaining}/3 · Selected {board.selectedWords.length}/4
          {isCollision ? " · Category Collision" : ""}
        </Text>
        {board.lastMessage ? (
          <Text
            style={[
              styles.message,
              board.oneAwayVisible ? { color: colors.warning } : null,
            ]}
            accessibilityLiveRegion="polite"
          >
            {board.lastMessage}
          </Text>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {board.solvedGroups.map((g) => (
          <SolvedGroupBand key={g.groupId} group={g} />
        ))}
        <View style={styles.grid}>
          {activeWords.map((word) => (
            <NounCard
              key={word}
              word={word}
              selected={board.selectedWords.includes(word)}
              locked={board.lockedHintWords.includes(word)}
              disabled={board.status !== "playing"}
              onPress={async () => {
                await toggle(word);
                if (settings.hapticsEnabled) {
                  try {
                    await Haptics.selectionAsync();
                  } catch {
                    // Haptics unavailable on some platforms.
                  }
                }
              }}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.actions, narrow ? styles.actionsNarrow : null]}>
        <ArchiveButton
          label="Submit"
          disabled={!canSubmitSelection()}
          onPress={async () => {
            const before = board.mistakesMade;
            await submit();
            const after = useAppStore.getState().board;
            if (settings.hapticsEnabled && after && after.mistakesMade > before) {
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } catch {
                /* optional */
              }
            }
          }}
        />
        <ArchiveButton label="Deselect" variant="secondary" onPress={() => void clear()} />
        <ArchiveButton
          label="Hint"
          variant="ghost"
          onPress={async () => {
            const result = await hint();
            if (!result.ok && result.message) {
              // Surface failure via live board message without spending tokens.
              const current = useAppStore.getState().board;
              if (current) {
                useAppStore.setState({
                  board: { ...current, lastMessage: result.message },
                });
              }
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xxxl,
  },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xs },
  kicker: { ...typography.label, color: colors.accent },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
  message: { ...typography.bodyStrong, color: colors.text, marginTop: spacing.xs },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  actionsNarrow: { flexWrap: "wrap" },
});
