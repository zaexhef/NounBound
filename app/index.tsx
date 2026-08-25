import { Redirect } from "expo-router";
import { useAppStore } from "@/store/appStore";

export default function Index() {
  const onboardingComplete = useAppStore((s) => s.progress.onboardingComplete);
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/home" />;
}
