export function cardAccessibilityLabel(noun: string, selected: boolean): string {
  return `${noun}, ${selected ? "selected" : "not selected"}`;
}

export function mistakesAccessibilityLabel(remaining: number): string {
  return `${remaining} mistake${remaining === 1 ? "" : "s"} remaining`;
}

export function countdownAccessibilityLabel(label: string, countdown: string): string {
  return `${label}: ${countdown} remaining`;
}

export function priceAccessibilityLabel(title: string, price: string | null): string {
  return price ? `${title}, ${price}` : `${title}, price unavailable`;
}

export function announceSolvedGroup(connection: string): string {
  return `Group solved: ${connection}`;
}

export function minTouchStyle(size = 44): { minWidth: number; minHeight: number } {
  return { minWidth: size, minHeight: size };
}
