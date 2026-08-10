import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { validateBundledContent } from "@/features/content/loader";
import { AD_PROVIDER_DECISION } from "@/features/ads/adapter";
import { PURCHASE_PROVIDER_DECISION } from "@/features/purchases/adapter";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function DiagnosticsScreen() {
  const router = useRouter();
  const flags = useAppStore((s) => s.flags);
  const issues = validateBundledContent();

  if (!flags.diagnosticsEnabled) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Diagnostics"
        subtitle="Development only — excluded from production behavior."
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.copy}>App env: {String(Constants.expoConfig?.extra?.appEnv)}</Text>
          <Text style={styles.copy}>Version: {Constants.expoConfig?.version}</Text>
          <Text style={styles.copy}>iOS build: {Constants.expoConfig?.ios?.buildNumber}</Text>
          <Text style={styles.copy}>Flags: {JSON.stringify(flags, null, 2)}</Text>
          <Text style={styles.copy}>Ad decision: {AD_PROVIDER_DECISION.status}</Text>
          <Text style={styles.copy}>Purchase decision: {PURCHASE_PROVIDER_DECISION.status}</Text>
          <Text style={styles.copy}>
            Content issues: {issues.filter((i) => i.severity === "error").length} errors /{" "}
            {issues.filter((i) => i.severity === "warning").length} warnings
          </Text>
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  copy: { ...typography.caption, color: colors.textMuted },
});
