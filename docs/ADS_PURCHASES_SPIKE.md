# Ads and purchases provider spike (Expo SDK 57)

## Decision

**Production provider: not selected.** Development and TestFlight use sandbox adapters.

## Compatibility notes

- Expo SDK 57 / React Native 0.86 requires verifying current config-plugin support before locking an ad or IAP SDK.
- Candidate ad SDK: `react-native-google-mobile-ads` (evaluate ATT, GDPR/UMP, child-directed treatment, and Expo prebuild).
- Candidate purchase layer: Expo-maintained IAP abstraction or `react-native-iap` once Expo compatibility is confirmed for this SDK pin.
- No production ad unit IDs, IAP shared secrets, or service-role keys are stored in the repository.

## Runtime posture

| Flag | Production default | Notes |
|---|---|---|
| `ENABLE_ECONOMY` | false | Domain + ledger implemented |
| `ENABLE_REWARDED_ADS` | false | Sandbox adapter only |
| Interstitials | false | Disabled experiment |
| `ENABLE_PURCHASES` | false | Sandbox restore/refund/duplicate covered |

## Remaining owner configuration

1. EAS project ID
2. App Store Connect App ID (`ascAppId` in `eas.json`)
3. App Store / Play product IDs matching provisional catalog
4. Paid Applications Agreement / banking / tax
5. Explicit approval to enable production ads or purchases
6. Privacy policy + support URLs

Public App Review is out of scope for this automation.
