/**
 * Temporary development icon notice
 *
 * The approved NounBound living-archive app icon was referenced in the build brief
 * but has not been committed as a master asset in this repository yet.
 *
 * Current placeholders (from Expo template — replace before release):
 * - assets/icon.png (1024×1024 opaque square for iOS; do not pre-round corners)
 * - assets/adaptive-icon.png / android-icon-*.png
 * - assets/splash-icon.png
 * - assets/favicon.png
 *
 * Required destination paths when the approved master is available:
 * - Preserve original master at assets/brand/nounbound-icon-master.png
 * - Generate Expo/iOS/Android derivatives into the paths above
 * - Configure adaptive Android foreground/background and splash treatment in app.config.ts
 */
export const ICON_STATUS = {
  approvedMasterPresent: false,
  usingTemporaryDevelopmentIcon: true,
  masterDestination: "assets/brand/nounbound-icon-master.png",
} as const;
