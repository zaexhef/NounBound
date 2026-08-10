import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { animation, colors, elevation, radius, spacing, typography } from "@/theme";
import { cardAccessibilityLabel } from "@/features/a11y/helpers";
import { useAppStore } from "@/store/appStore";

interface NounCardProps {
  word: string;
  selected: boolean;
  locked?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function NounCard({ word, selected, locked, onPress, disabled }: NounCardProps) {
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const highContrast = useAppStore((s) => s.settings.highContrast);
  const largeText = useAppStore((s) => s.settings.largeText);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withTiming(selected ? 1.04 : 1, { duration: animation.selectionMs });
  }, [selected, reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColor = locked
    ? colors.success
    : selected
      ? highContrast
        ? colors.highContrast.accent
        : colors.selectedBorder
      : highContrast
        ? colors.highContrast.border
        : colors.border;
  const backgroundColor = locked
    ? colors.lockedFill
    : selected
      ? colors.selectedFill
      : highContrast
        ? colors.highContrast.cardFace
        : colors.cardFace;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cardAccessibilityLabel(word, selected || !!locked)}
        accessibilityState={{ selected: selected || !!locked, disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.card,
          elevation.card as ViewStyle,
          {
            borderColor,
            backgroundColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.noun,
            {
              color: highContrast ? colors.highContrast.text : colors.text,
              fontSize: largeText ? 16 : typography.cardNoun.fontSize,
            },
          ]}
          numberOfLines={3}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {word}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexBasis: "25%",
    maxWidth: "25%",
    padding: spacing.xs,
  },
  card: {
    minHeight: 72,
    borderRadius: radius.card,
    borderWidth: 2,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  noun: {
    ...typography.cardNoun,
    textAlign: "center",
  },
});
