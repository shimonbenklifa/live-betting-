/**
 * Deterministic implied-probability history for demo markets.
 *
 * Real markets store a time series of trades; in demo mode we synthesise a
 * stable, good-looking price path that ENDS at each outcome's current implied
 * probability, seeded by the outcome id so it never changes between renders.
 */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo = 2, hi = 98) => Math.min(hi, Math.max(lo, v));

/**
 * Build a `points`-long series of implied-probability values (in cents) that
 * ends exactly at `endCents`. Walked backwards so the final point is anchored.
 */
export function priceHistory(seed: string, endCents: number, points = 28, volatility = 6): number[] {
  const rng = mulberry32(hashString(seed));
  const out = new Array<number>(points);
  out[points - 1] = endCents;
  for (let i = points - 2; i >= 0; i--) {
    const drift = (rng() - 0.5) * volatility * 2;
    out[i] = clamp(Math.round(out[i + 1] + drift));
  }
  return out;
}

/**
 * Generic value path (e.g. portfolio equity in credits) ending at `endValue`,
 * walked backwards with multiplicative noise. No 0–100 clamp.
 */
export function valueHistory(seed: string, endValue: number, points = 28, volPct = 0.02): number[] {
  const rng = mulberry32(hashString(seed));
  const out = new Array<number>(points);
  out[points - 1] = endValue;
  for (let i = points - 2; i >= 0; i--) {
    const factor = 1 + (rng() - 0.5) * volPct * 2;
    out[i] = Math.max(1, Math.round(out[i + 1] * factor));
  }
  return out;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: number[];
  currentCents: number;
}

/** Palette for multi-outcome charts (distinct, color-blind-friendly-ish). */
export const SERIES_COLORS = ["#2563eb", "#0f9d6b", "#b45309", "#9333ea", "#e0233a", "#0891b2"];

/** Build chart series for up to `max` outcomes of a market. */
export function marketSeries(
  outcomes: { id: string; label: string; priceCents: number }[],
  max = 5
): ChartSeries[] {
  const top = [...outcomes].sort((a, b) => b.priceCents - a.priceCents).slice(0, max);
  return top.map((o, i) => ({
    label: o.label,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    currentCents: o.priceCents,
    points: priceHistory(o.id, o.priceCents)
  }));
}
