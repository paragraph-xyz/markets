import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsdPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return "—";

  if (price === 0) return "$0.00";

  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }

  // For very small prices, show significant digits
  const str = price.toFixed(10);
  const match = str.match(/^0\.(0*)([1-9]\d{0,3})/);
  if (match) {
    const zeros = match[1].length;
    const significantPart = match[2].slice(0, 4);
    return `$0.${"0".repeat(zeros)}${significantPart}`;
  }

  return `$${price.toPrecision(4)}`;
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(0)}`;
}
