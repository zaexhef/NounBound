import type { ExpoConfig, ConfigContext } from "expo/config";

const IS_PROD = process.env.APP_ENV === "production";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "NounBound",
  slug: "nounbound",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "nounbound",
  userInterfaceStyle: "automatic",
  backgroundColor: "#1A1210",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.nounbound.app",
    buildNumber: "1",
    infoPlist: {
      NSUserTrackingUsageDescription:
        "NounBound only requests tracking permission if personalized advertising is enabled and legally required.",
    },
  },
  android: {
    package: "com.nounbound.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
      backgroundColor: "#1A1210",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-sqlite",
    "expo-audio",
    "expo-asset",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#1A1210",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "00000000-0000-0000-0000-000000000000",
    },
    appEnv: process.env.APP_ENV ?? "development",
    enableEconomy: process.env.ENABLE_ECONOMY === "true",
    enableRewardedAds: process.env.ENABLE_REWARDED_ADS === "true",
    enableInterstitials: false,
    enablePurchases: process.env.ENABLE_PURCHASES === "true",
    useSandboxProviders: !IS_PROD,
    router: {},
  },
  owner: "zaexhef",
});
