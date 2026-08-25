import { cardAccessibilityLabel, mistakesAccessibilityLabel, priceAccessibilityLabel } from "../../src/features/a11y/helpers";
import { colors, a11y } from "../../src/theme";

describe("accessibility helpers", () => {
  it("labels selection state without relying on color alone", () => {
    expect(cardAccessibilityLabel("Mercury", true)).toContain("selected");
    expect(cardAccessibilityLabel("Mercury", false)).toContain("not selected");
    expect(mistakesAccessibilityLabel(1)).toBe("1 mistake remaining");
    expect(priceAccessibilityLabel("Coin Pouch", "$2.99")).toContain("$2.99");
  });

  it("defines minimum touch target and contrast tokens", () => {
    expect(a11y.minTouchTarget).toBeGreaterThanOrEqual(44);
    expect(colors.highContrast.text).toBe("#FFFFFF");
    expect(colors.highContrast.background).toBe("#000000");
  });
});
