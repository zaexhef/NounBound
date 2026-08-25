import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        brand
        title="Every noun belongs somewhere."
        subtitle="Find the connection."
        world="history"
      >
        <View style={styles.body}>
          <Text style={styles.copy}>
            Inspect 16 noun cards. Divide them into four intended groups of four. Ambiguous
            nouns create fair misdirection—but every board keeps one defensible partition.
          </Text>
          <Text style={styles.copy}>
            Signature journeys span Celebrity Spotlight, Motor City Garage, House of Objects,
            and History Vault.
          </Text>
          <ArchiveButton
            label="Begin tutorial"
            onPress={async () => {
              await completeOnboarding();
              router.replace("/tutorial");
            }}
          />
          <ArchiveButton
            label="Skip to archive"
            variant="ghost"
            onPress={async () => {
              await completeOnboarding();
              router.replace("/home");
            }}
          />
        </View>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { gap: spacing.lg, marginTop: spacing.xl },
  copy: { ...typography.body, color: colors.textMuted, lineHeight: 24 },
});
