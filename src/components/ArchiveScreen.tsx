import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, worldThemes, WorldId } from "@/theme";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  brand?: boolean;
  world?: WorldId;
  children: React.ReactNode;
  style?: ViewStyle;
  rightSlot?: React.ReactNode;
}

export function ArchiveScreen({
  title,
  subtitle,
  brand,
  world = "history",
  children,
  style,
  rightSlot,
}: ScreenProps) {
  const theme = worldThemes[world] ?? worldThemes.history;
  return (
    <LinearGradient colors={[...theme.gradient]} style={styles.gradient}>
      <View style={[styles.container, style]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {brand ? (
              <Text accessibilityRole="header" style={styles.brand}>
                NounBound
              </Text>
            ) : null}
            {title ? (
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightSlot}
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  brand: {
    ...typography.brand,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
