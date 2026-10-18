// Accent colour picked in Settings, saved as "H S% L%" (for example "24 95% 53%").
// Only the brand hue, saturation and lightness are overridden; index.css derives the
// light- and dark-mode shades from them, so dark mode stays dark with any accent.
const ACCENT_KEY = "prodify-accent-color";

export function applyAccentColor(hsl: string) {
  const parts = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!parts) return;
  const root = document.documentElement;
  root.style.setProperty("--brand-h", parts[1]);
  root.style.setProperty("--brand-s", `${parts[2]}%`);
  root.style.setProperty("--brand-l", `${parts[3]}%`);
}

export function applySavedAccentColor() {
  try {
    const saved = localStorage.getItem(ACCENT_KEY);
    if (saved) applyAccentColor(JSON.parse(saved));
  } catch {
    // Ignore a malformed saved colour and keep the default
  }
}
