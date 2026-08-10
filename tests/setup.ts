jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
  multiRemove: jest.fn(async () => undefined),
}));

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => {
    throw new Error("sqlite unavailable in tests");
  }),
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Error: "error", Success: "success" },
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        appEnv: "development",
        enableEconomy: false,
        enableRewardedAds: false,
        enablePurchases: false,
      },
      version: "1.0.0",
      ios: { buildNumber: "1" },
    },
  },
}));
