import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import { colors, spacing, typography } from "@/theme";

const STEPS = [
  {
    title: "Select four nouns",
    body: "Tap cards to select up to four. Submit is enabled only when exactly four are selected.",
  },
  {
    title: "Correct groups lock",
    body: "A correct set locks into a labeled band. Incorrect guesses cost one of three mistakes.",
  },
  {
    title: "One away — through Normal",
    body: "If three cards belong to a group, you may hear “One away.” Expert boards hide that cue.",
  },
  {
    title: "Hints are progressive",
    body: "Broad subject → lock a noun → remove a decoy → reveal the label. Early play needs no paid hints.",
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        brand
        title="Interactive tutorial"
        subtitle={`Step ${step + 1} of ${STEPS.length}`}
        world="objects"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
        </View>
        <View style={styles.actions}>
          {step < STEPS.length - 1 ? (
            <ArchiveButton label="Next" onPress={() => setStep((s) => s + 1)} />
          ) : (
            <ArchiveButton
              label="Play first puzzle"
              onPress={() => router.replace({ pathname: "/puzzle/[id]", params: { id: "tutorial-001" } })}
            />
          )}
          <ArchiveButton label="Back to home" variant="ghost" onPress={() => router.replace("/home")} />
        </View>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.title, color: colors.text },
  body: { ...typography.body, color: colors.textMuted, lineHeight: 24 },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
