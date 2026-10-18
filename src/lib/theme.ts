// Accent colour picked in Settings, saved as "H S% L%" (for example "152 60% 52%").
// Only the brand hue, saturation and lightness are overridden; index.css builds the
// primary colour from them. Every option is light enough for dark text on top of it.
const ACCENT_KEY = "prodify-accent";

export const ACCENT_COLORS = [
  { name: "Green", hsl: "152 60% 52%", hex: "#3bce89" },
  { name: "Blue", hsl: "213 94% 68%", hex: "#60a5fa" },
  { name: "Violet", hsl: "255 92% 76%", hex: "#a78bfa" },
  { name: "Cyan", hsl: "188 86% 53%", hex: "#22d3ee" },
  { name: "Amber", hsl: "43 96% 56%", hex: "#fbbf24" },
  { name: "Mono", hsl: "240 5% 90%", hex: "#e4e4e7" },
];

export const DEFAULT_ACCENT = ACCENT_COLORS[0].hsl;

export function applyAccentColor(hsl: string) {
  const parts = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!parts) return;
  const root = document.documentElement;
  root.style.setProperty("--brand-h", parts[1]);
  root.style.setProperty("--brand-s", `${parts[2]}%`);
  root.style.setProperty("--brand-l", `${parts[3]}%`);
}

export function loadAccentColor(): string {
  try {
    const saved = localStorage.getItem(ACCENT_KEY);
    const hsl = saved ? JSON.parse(saved) : null;
    return ACCENT_COLORS.some((c) => c.hsl === hsl) ? hsl : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function saveAccentColor(hsl: string) {
  try {
    localStorage.setItem(ACCENT_KEY, JSON.stringify(hsl));
  } catch {
    // Private mode or blocked storage: the colour still applies for this visit
  }
}

export function applySavedAccentColor() {
  applyAccentColor(loadAccentColor());
}
