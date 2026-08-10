export type ProductType =
  | "consumable_coins"
  | "non_consumable_ad_removal"
  | "starter_bundle"
  | "cosmetic_pack"
  | "premium_theme_pack";

export interface StoreProduct {
  productId: string;
  type: ProductType;
  title: string;
  description: string;
  /** Localized price string from the store when available; never hard-code as authoritative. */
  localizedPrice: string | null;
  /** Target reference only — not authoritative store pricing. */
  targetUsdHint: number | null;
  coinAmount?: number;
  grantsAdRemoval?: boolean;
  cosmeticIds?: string[];
}

export type PurchaseStatus =
  | "completed"
  | "cancelled"
  | "pending"
  | "failed"
  | "refunded"
  | "revoked"
  | "restored";

export interface PurchaseResult {
  status: PurchaseStatus;
  productId: string;
  transactionId: string;
  originalTransactionId?: string;
}

export interface PurchaseProviderAdapter {
  readonly name: string;
  getProducts(): Promise<StoreProduct[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult[]>;
}

export const PROVISIONAL_PRODUCTS: StoreProduct[] = [
  {
    productId: "coins_250",
    type: "consumable_coins",
    title: "Pocket of Coins",
    description: "250 Noun Coins",
    localizedPrice: null,
    targetUsdHint: 0.99,
    coinAmount: 250,
  },
  {
    productId: "coins_700",
    type: "consumable_coins",
    title: "Coin Pouch",
    description: "700 Noun Coins",
    localizedPrice: null,
    targetUsdHint: 2.99,
    coinAmount: 700,
  },
  {
    productId: "coins_1500",
    type: "consumable_coins",
    title: "Coin Case",
    description: "1,500 Noun Coins",
    localizedPrice: null,
    targetUsdHint: 4.99,
    coinAmount: 1500,
  },
  {
    productId: "coins_3500",
    type: "consumable_coins",
    title: "Coin Vault",
    description: "3,500 Noun Coins",
    localizedPrice: null,
    targetUsdHint: 9.99,
    coinAmount: 3500,
  },
  {
    productId: "coins_8000",
    type: "consumable_coins",
    title: "Collector Vault",
    description: "8,000 Noun Coins",
    localizedPrice: null,
    targetUsdHint: 19.99,
    coinAmount: 8000,
  },
  {
    productId: "ad_removal",
    type: "non_consumable_ad_removal",
    title: "Remove Forced Ads",
    description: "Permanently remove interstitial and banner ads. Rewarded ads remain optional.",
    localizedPrice: null,
    targetUsdHint: 3.99,
    grantsAdRemoval: true,
  },
  {
    productId: "starter_bundle",
    type: "starter_bundle",
    title: "Starter Bundle",
    description: "Ad removal, 700 coins, and Archive Bronze card back",
    localizedPrice: null,
    targetUsdHint: 4.99,
    coinAmount: 700,
    grantsAdRemoval: true,
    cosmeticIds: ["archive_bronze"],
  },
];

export class SandboxPurchaseAdapter implements PurchaseProviderAdapter {
  readonly name = "sandbox";
  private behavior: PurchaseStatus = "completed";
  private owned = new Set<string>();
  private seenTx = new Set<string>();

  setBehavior(status: PurchaseStatus) {
    this.behavior = status;
  }

  async getProducts(): Promise<StoreProduct[]> {
    return PROVISIONAL_PRODUCTS.map((p) => ({
      ...p,
      localizedPrice: p.targetUsdHint != null ? `$${p.targetUsdHint.toFixed(2)} USD (sandbox)` : null,
    }));
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    const transactionId = `sandbox_tx_${productId}_${Date.now()}`;
    if (this.seenTx.has(transactionId)) {
      return { status: "completed", productId, transactionId };
    }
    if (this.behavior === "cancelled") {
      return { status: "cancelled", productId, transactionId };
    }
    if (this.behavior === "failed") {
      return { status: "failed", productId, transactionId };
    }
    if (this.behavior === "pending") {
      return { status: "pending", productId, transactionId };
    }
    this.seenTx.add(transactionId);
    const product = PROVISIONAL_PRODUCTS.find((p) => p.productId === productId);
    if (product?.grantsAdRemoval) this.owned.add("ad_removal");
    if (product?.type === "non_consumable_ad_removal") this.owned.add(productId);
    return { status: "completed", productId, transactionId };
  }

  async restore(): Promise<PurchaseResult[]> {
    return [...this.owned].map((productId) => ({
      status: "restored" as const,
      productId,
      transactionId: `restore_${productId}`,
      originalTransactionId: `original_${productId}`,
    }));
  }

  revoke(productId: string) {
    this.owned.delete(productId);
  }
}

let purchaseAdapter: PurchaseProviderAdapter = new SandboxPurchaseAdapter();

export function getPurchaseAdapter(): PurchaseProviderAdapter {
  return purchaseAdapter;
}

export function setPurchaseAdapter(adapter: PurchaseProviderAdapter): void {
  purchaseAdapter = adapter;
}

export const PURCHASE_PROVIDER_DECISION = {
  status: "sandbox_default",
  productionProvider: null,
  rationale:
    "Expo IAP / react-native-iap compatibility must be verified against SDK 57 before production wiring. Sandbox adapter covers entitlements, restore, refund, and duplicate protection tests.",
  remainingConfiguration: [
    "App Store Connect product IDs",
    "Google Play product IDs",
    "EAS Submit ASC App ID",
    "Paid Applications Agreement / banking",
    "Owner approval to enable ENABLE_PURCHASES",
  ],
} as const;
