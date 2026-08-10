import React from "react";
import { ScrollView, StyleSheet, Text, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";

export default function LegalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen title="Privacy, support & legal" subtitle="Minimize data. No secrets in the client.">
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.copy}>
            NounBound MVP stores progress locally on device. No account is required. Analytics,
            personalized advertising, and online accounts remain disabled until explicitly approved
            with matching privacy disclosures.
          </Text>
          <Text style={styles.copy}>
            If accounts are introduced later, a data-deletion path will be provided. Remote content
            is treated as untrusted input and validated before activation.
          </Text>
          <Text style={styles.copy}>
            Support: replace with the owner-approved support email/URL before public release.
          </Text>
          <ArchiveButton
            label="Open privacy policy placeholder"
            variant="secondary"
            onPress={() => {
              void Linking.openURL("https://example.com/nounbound-privacy");
            }}
          />
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxxl },
  copy: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
