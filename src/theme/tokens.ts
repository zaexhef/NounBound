/**
 * NounBound design tokens — living archive visual direction.
 * World accents: Celebrity (plum/gold), Motor City (blue/red),
 * House of Objects (teal/amber), History Vault (parchment/bronze/charcoal).
 */

export const palette = {
  archiveBlack: "#1A1210",
  charcoal: "#2A221F",
  parchment: "#F3E6D4",
  parchmentMuted: "#E0D0BA",
  bronze: "#B08D57",
  bronzeLight: "#C9A86A",
  gold: "#D4AF37",
  goldSoft: "#E8C96A",
  cream: "#FFF8EE",
  ink: "#1C1412",
  inkMuted: "#5C4E46",
  success: "#2F6B4F",
  danger: "#8B3A3A",
  warning: "#9A6B2F",
  selected: "#D4AF37",
  locked: "#3D5A4A",
  // World accents
  celebrityPlum: "#5C2D4E",
  celebrityGold: "#D4AF37",
  motorBlue: "#1B3A5C",
  motorRed: "#C0392B",
  objectsTeal: "#1F5C5A",
  objectsAmber: "#C48A3A",
  historyParchment: "#E8D9C0",
  historyBronze: "#8B6914",
  historyCharcoal: "#2C2A28",
} as const;

// Fix typo in bronze - I accidentally wrote "A penB67A"
export const colors = {
  background: palette.archiveBlack,
  backgroundElevated: palette.charcoal,
  surface: "#241C19",
  surfaceMuted: "#322824",
  text: palette.cream,
  textMuted: palette.parchmentMuted,
  textInverse: palette.ink,
  border: "#4A3B34",
  borderStrong: palette.bronzeLight,
  accent: palette.gold,
  accentSoft: palette.goldSoft,
  bronze: "#B08D57",
  bronzeLight: palette.bronzeLight,
  parchment: palette.parchment,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
  selectedBorder: palette.gold,
  selectedFill: "rgba(212, 175, 55, 0.18)",
  lockedFill: "rgba(47, 107, 79, 0.35)",
  mistake: palette.danger,
  cardFace: "#2E2420",
  cardFaceSelected: "#3A2F28",
  overlay: "rgba(10, 6, 4, 0.72)",
  highContrast: {
    background: "#000000",
    text: "#FFFFFF",
    accent: "#FFD700",
    border: "#FFFFFF",
    cardFace: "#111111",
  },
} as const;

export const worldThemes = {
  celebrity: {
    id: "celebrity" as const,
    name: "Celebrity Spotlight",
    primary: palette.celebrityPlum,
    accent: palette.celebrityGold,
    surface: "#3A1F32",
    gradient: [palette.celebrityPlum, palette.archiveBlack] as const,
  },
  automotive: {
    id: "automotive" as const,
    name: "Motor City Garage",
    primary: palette.motorBlue,
    accent: palette.motorRed,
    surface: "#15283C",
    gradient: [palette.motorBlue, palette.archiveBlack] as const,
  },
  objects: {
    id: "objects" as const,
    name: "House of Objects",
    primary: palette.objectsTeal,
    accent: palette.objectsAmber,
    surface: "#163836",
    gradient: [palette.objectsTeal, palette.archiveBlack] as const,
  },
  history: {
    id: "history" as const,
    name: "History Vault",
    primary: palette.historyCharcoal,
    accent: palette.historyBronze,
    surface: "#2A2622",
    gradient: [palette.historyCharcoal, "#1A1510"] as const,
  },
  crossover: {
    id: "crossover" as const,
    name: "Category Collision",
    primary: palette.bronze,
    accent: palette.gold,
    surface: "#3A2E22",
    gradient: ["#4A3520", palette.archiveBlack] as const,
  },
} as const;

export type WorldId = keyof typeof worldThemes;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  card: 12,
  pill: 999,
} as const;

export const typography = {
  brand: {
    fontFamily: "System",
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
  },
  hero: {
    fontFamily: "System",
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: "System",
    fontSize: 22,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontFamily: "System",
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodyStrong: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  caption: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "500" as const,
  },
  cardNoun: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
};

export const elevation = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  raised: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

export const animation = {
  selectionMs: 150,
  groupLockMs: 320,
  feedbackMs: 220,
  fadeMs: 180,
  journeyRestoreMs: 500,
} as const;

export const a11y = {
  minTouchTarget: 44,
  contrastModes: ["normal", "high"] as const,
};

export const theme = {
  colors,
  worldThemes,
  spacing,
  radius,
  typography,
  elevation,
  animation,
  a11y,
  palette,
} as const;

export type Theme = typeof theme;
