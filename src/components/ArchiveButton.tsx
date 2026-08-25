import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from "react-native";
import { colors, radius, spacing, typography, a11y } from "@/theme";
import { useAppStore } from "@/store/appStore";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function ArchiveButton({
  label,
  onPress,
  disabled,
  variant = "primary",
  style,
  accessibilityHint,
}: ButtonProps) {
  const highContrast = useAppStore((s) => s.settings.highContrast);
  const background =
    variant === "primary"
      ? highContrast
        ? colors.highContrast.accent
        : colors.accent
      : variant === "danger"
        ? colors.danger
        : variant === "secondary"
          ? colors.surfaceMuted
          : "transparent";
  const textColor =
    variant === "primary"
      ? colors.textInverse
      : highContrast
        ? colors.highContrast.text
        : colors.text;

  return (
    <Pressable
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          borderColor:
            variant === "ghost"
              ? highContrast
                ? colors.highContrast.border
                : colors.borderStrong
              : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: a11y.minTouchTarget,
    minWidth: a11y.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.bodyStrong,
  } as TextStyle,
});
