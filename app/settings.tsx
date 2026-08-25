import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={onToggle}
      style={styles.row}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ? "On" : "Off"}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Settings & accessibility"
        subtitle="No information is conveyed only through color, motion, or audio."
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <ToggleRow
            label="Sound"
            value={settings.soundEnabled}
            onToggle={() => void updateSettings({ soundEnabled: !settings.soundEnabled })}
          />
          <ToggleRow
            label="Haptics"
            value={settings.hapticsEnabled}
            onToggle={() => void updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
          />
          <ToggleRow
            label="Reduced motion"
            value={settings.reducedMotion}
            onToggle={() => void updateSettings({ reducedMotion: !settings.reducedMotion })}
          />
          <ToggleRow
            label="High contrast"
            value={settings.highContrast}
            onToggle={() => void updateSettings({ highContrast: !settings.highContrast })}
          />
          <ToggleRow
            label="Large text"
            value={settings.largeText}
            onToggle={() => void updateSettings({ largeText: !settings.largeText })}
          />
          <View style={styles.note}>
            <Text style={styles.copy}>
              Touch targets stay at least 44×44. Screen-reader labels include selection state.
              Countdowns and prices expose accessible text.
            </Text>
          </View>
          <ArchiveButton label="Restore purchases" onPress={() => router.push("/restore")} />
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
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { ...typography.body, color: colors.text },
  value: { ...typography.bodyStrong, color: colors.accent },
  note: { marginTop: spacing.md },
  copy: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
