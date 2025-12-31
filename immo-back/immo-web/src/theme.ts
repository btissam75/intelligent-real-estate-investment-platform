// src/theme.ts
export type Palette = {
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  brand: string;
  brandSoft: string;
  success: string;
  danger: string;
  warning: string;
  shadow: string;
};

export const light: Palette = {
  bg: "linear-gradient(160deg,#f6f8fb 0%,#f2f6ff 50%,#eef5ff 100%)",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textMuted: "#64748b",
  brand: "#0ea5e9",
  brandSoft: "#e0f2fe",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  shadow: "0 18px 48px rgba(2,6,23,.06)",
};

export const dark: Palette = {
  bg: "linear-gradient(160deg,#0b1220 0%,#0d1526 50%,#0f1b33 100%)",
  card: "#0f172a",
  border: "#1f2937",
  text: "#e5e7eb",
  textMuted: "#9ca3af",
  brand: "#38bdf8",
  brandSoft: "#073042",
  success: "#22c55e",
  danger: "#f87171",
  warning: "#fbbf24",
  shadow: "0 18px 48px rgba(0,0,0,.4)",
};

export function withAlpha(hex: string, a = 0.08) {
  // hex #RRGGBB -> rgba
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
