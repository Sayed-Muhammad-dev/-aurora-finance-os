import { currencyMap } from "@/data/finance";
import type { CurrencyCode } from "@/types";

/** Converts a USD figure into the display currency and formats it. */
export function money(usd: number, code: CurrencyCode = "USD", compact = false) {
  const currency = currencyMap[code];
  const value = usd * currency.rateFromUsd;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0
  }).format(value);
}

/** Formats a figure already expressed in its own currency. */
export function nativeMoney(value: number, code: CurrencyCode, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0
  }).format(value);
}

export function percent(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function ratio(part: number, whole: number) {
  return whole === 0 ? 0 : (part / whole) * 100;
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value.length > 10 ? value : `${value}T00:00:00Z`));
}

export function timestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(`${value}Z`));
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
