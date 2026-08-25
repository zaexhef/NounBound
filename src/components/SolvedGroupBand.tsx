import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";
import { SolvedGroupState } from "@/features/game/engine";

export function SolvedGroupBand({ group }: { group: SolvedGroupState }) {
  return (
    <View
      style={styles.band}
      accessibilityRole="text"
      accessibilityLabel={`Solved group ${group.connection}: ${group.words.join(", ")}`}
    >
      <Text style={styles.label}>{group.connection}</Text>
      <Text style={styles.words}>{group.words.join(" · ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.lockedFill,
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  words: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
