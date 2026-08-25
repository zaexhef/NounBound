import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArchiveScreen } from "@/components/ArchiveScreen";
import { ArchiveButton } from "@/components/ArchiveButton";
import {
  getPurchaseAdapter,
  PROVISIONAL_PRODUCTS,
  StoreProduct,
} from "@/features/purchases/adapter";
import { economyService } from "@/features/economy/service";
import { priceAccessibilityLabel } from "@/features/a11y/helpers";
import { colors, spacing, typography } from "@/theme";
import { useAppStore } from "@/store/appStore";

export default function RestorePurchasesScreen() {
  const router = useRouter();
  const flags = useAppStore((s) => s.flags);
  const setAdRemoval = useAppStore((s) => s.setAdRemoval);
  const refreshEconomy = useAppStore((s) => s.refreshEconomy);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getPurchaseAdapter()
      .getProducts()
      .then(setProducts)
      .catch(() => setProducts(PROVISIONAL_PRODUCTS));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ArchiveScreen
        title="Purchases & restore"
        subtitle="Sandbox adapter until App Store products and owner approval are configured."
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {!flags.purchasesEnabled ? (
            <Text style={styles.copy}>
              Purchases remain feature-flagged off. Architecture, mocks, and restore flow are ready
              for sandbox verification.
            </Text>
          ) : null}
          {products.map((p) => (
            <View
              key={p.productId}
              style={styles.row}
              accessibilityLabel={priceAccessibilityLabel(p.title, p.localizedPrice)}
            >
              <Text style={styles.title}>{p.title}</Text>
              <Text style={styles.copy}>{p.description}</Text>
              <Text style={styles.meta}>
                {p.localizedPrice ?? "Localized price unavailable — target hint only"}
                {p.targetUsdHint != null ? ` (target ~$${p.targetUsdHint.toFixed(2)})` : ""}
              </Text>
              <ArchiveButton
                label="Sandbox purchase"
                variant="secondary"
                onPress={async () => {
                  const result = await getPurchaseAdapter().purchase(p.productId);
                  if (result.status === "completed" || result.status === "restored") {
                    if (p.grantsAdRemoval) await setAdRemoval(true);
                    if (p.coinAmount && flags.economyEnabled) {
                      await economyService.awardCoins({
                        idempotencyKey: `purchase_${result.transactionId}`,
                        reason: "purchase_coins",
                        amount: p.coinAmount,
                        relatedPurchaseId: result.transactionId,
                        asPurchased: true,
                      });
                      await refreshEconomy();
                    }
                    if (p.cosmeticIds?.length) {
                      await useAppStore.getState().unlockCosmetics(p.cosmeticIds);
                    }
                  }
                  setMessage(`Purchase ${result.status}: ${result.transactionId}`);
                }}
              />
            </View>
          ))}
          <ArchiveButton
            label="Restore purchases"
            onPress={async () => {
              const results = await getPurchaseAdapter().restore();
              for (const r of results) {
                if (r.productId === "ad_removal" || r.productId.includes("ad_removal")) {
                  await setAdRemoval(true);
                }
                const product = PROVISIONAL_PRODUCTS.find((p) => p.productId === r.productId);
                if (product?.cosmeticIds?.length) {
                  await useAppStore.getState().unlockCosmetics(product.cosmeticIds);
                }
              }
              setMessage(
                results.length
                  ? `Restored ${results.length} entitlement(s).`
                  : "No restorable entitlements found.",
              );
            }}
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <ArchiveButton label="Back" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </ArchiveScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { gap: spacing.md, paddingBottom: spacing.xxxl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.subtitle, color: colors.text },
  copy: { ...typography.body, color: colors.textMuted },
  meta: { ...typography.caption, color: colors.accent },
  message: { ...typography.bodyStrong, color: colors.warning },
});
