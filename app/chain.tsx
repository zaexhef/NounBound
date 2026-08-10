import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { animation, colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function ConnectionChainScreen() {
  const { noun, to, from, toWorld } = useLocalSearchParams<{
    noun?: string;
    to?: string;
    from?: string;
    toWorld?: string;
  }>();
  const router = useRouter();
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const scale = useSharedValue(reducedMotion ? 1 : 0.92);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = withTiming(1, { duration: animation.journeyRestoreMs });
    scale.value = withSequence(
      withTiming(1.06, { duration: animation.groupLockMs }),
      withTiming(1, { duration: animation.feedbackMs }),
    );
  }, [opacity, scale, reducedMotion]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Connection Chain"
        subtitle="A solved board reveals the path forward."
        world="crossover"
      >
        <Animated.View style={[styles.portal, anim]}>
          <Text style={styles.label}>Revealed link</Text>
          <Text style={styles.noun}>{noun ?? "Restoration"}</Text>
          {from ? <Text style={styles.meta}>From {from}</Text> : null}
        </Animated.View>
        <View style={styles.actions}>
          {to ? (
            <ArchiveButton
              label="Continue to next puzzle"
              onPress={() => router.replace({ pathname: "/puzzle/[id]", params: { id: to } })}
            />
          ) : null}
          {toWorld ? (
            <ArchiveButton
              label="Enter next world"
              onPress={() => router.replace({ pathname: "/world/[id]", params: { id: toWorld } })}
            />
          ) : null}
          <ArchiveButton label="Journey map" variant="ghost" onPress={() => router.replace("/journey")} />
        </View>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  portal: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  label: { ...typography.label, color: colors.accent },
  noun: { ...typography.hero, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
