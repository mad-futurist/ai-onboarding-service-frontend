export const THEME_STORAGE_KEY = "readyset-theme";
export const FONT_STORAGE_KEY = "readyset-font";
export const CUSTOM_COLOR_STORAGE_KEY = "readyset-custom-colors";

export const THEME_IDS = [
  "current",
  "sunset-orange",
  "solar-amber",
  "cyber-tech",
  "velvet-premium",
  "coral-marketing",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "current";

export const FONT_IDS = [
  "theme",
  "geist",
  "dm-sans",
  "ibm-plex-sans",
  "space-grotesk",
  "outfit",
] as const;

export type FontId = (typeof FONT_IDS)[number];

export const DEFAULT_FONT_ID: FontId = "theme";

export const CUSTOM_COLOR_TOKENS = [
  { key: "bg", label: "Background", group: "Surfaces", fallback: "#FFF7F0" },
  { key: "surface", label: "Surface", group: "Surfaces", fallback: "#FFFFFF" },
  { key: "surface-muted", label: "Surface muted", group: "Surfaces", fallback: "#FFF0E0" },
  { key: "surface-elevated", label: "Surface elevated", group: "Surfaces", fallback: "#FFFFFF" },
  { key: "border", label: "Border", group: "Surfaces", fallback: "#FFD199" },
  { key: "border-strong", label: "Border strong", group: "Surfaces", fallback: "#FFAA55" },
  { key: "fg", label: "Text", group: "Text", fallback: "#1A0E00" },
  { key: "fg-muted", label: "Text muted", group: "Text", fallback: "#7A5030" },
  { key: "fg-subtle", label: "Text subtle", group: "Text", fallback: "#A66A32" },
  { key: "fg-faint", label: "Text faint", group: "Text", fallback: "#FFAA55" },
  { key: "primary", label: "Primary", group: "Brand", fallback: "#CC5500" },
  { key: "primary-hover", label: "Primary hover", group: "Brand", fallback: "#FF8C00" },
  { key: "primary-active", label: "Primary active", group: "Brand", fallback: "#3D2000" },
  { key: "primary-soft", label: "Primary soft", group: "Brand", fallback: "#FFF0E0" },
  { key: "primary-softer", label: "Primary softer", group: "Brand", fallback: "#FFD199" },
  { key: "primary-ring", label: "Primary ring", group: "Brand", fallback: "#FFD199" },
  { key: "primary-fg", label: "Primary text", group: "Brand", fallback: "#FFFFFF" },
  { key: "ai-from", label: "AI gradient from", group: "AI", fallback: "#CC5500" },
  { key: "ai-via", label: "AI gradient via", group: "AI", fallback: "#FF8C00" },
  { key: "ai-to", label: "AI gradient to", group: "AI", fallback: "#FFAA55" },
  { key: "ai-soft-from", label: "AI soft from", group: "AI", fallback: "#FFF7F0" },
  { key: "ai-soft-via", label: "AI soft via", group: "AI", fallback: "#FFF0E0" },
  { key: "ai-soft-to", label: "AI soft to", group: "AI", fallback: "#FFD199" },
  { key: "success", label: "Success", group: "Status", fallback: "#10B981" },
  { key: "success-soft", label: "Success soft", group: "Status", fallback: "#ECFDF5" },
  { key: "success-fg", label: "Success text", group: "Status", fallback: "#047857" },
  { key: "warning", label: "Warning", group: "Status", fallback: "#F59E0B" },
  { key: "warning-soft", label: "Warning soft", group: "Status", fallback: "#FFFBEB" },
  { key: "warning-fg", label: "Warning text", group: "Status", fallback: "#B45309" },
  { key: "danger", label: "Danger", group: "Status", fallback: "#F43F5E" },
  { key: "danger-soft", label: "Danger soft", group: "Status", fallback: "#FFF1F2" },
  { key: "danger-fg", label: "Danger text", group: "Status", fallback: "#BE123C" },
  { key: "info", label: "Info", group: "Status", fallback: "#3B82F6" },
  { key: "info-soft", label: "Info soft", group: "Status", fallback: "#EFF6FF" },
  { key: "info-fg", label: "Info text", group: "Status", fallback: "#1D4ED8" },
] as const;

export type CustomColorToken = (typeof CUSTOM_COLOR_TOKENS)[number];
export type CustomColorKey = CustomColorToken["key"];
export type CustomColorOverrides = Partial<Record<CustomColorKey, string>>;

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  fontLabel: string;
  swatches: string[];
}

export interface FontOption {
  id: FontId;
  name: string;
  description: string;
  sample: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "current",
    name: "Current (default)",
    description: "The original app palette — warm stone surfaces with orange-500 accent.",
    fontLabel: "Geist",
    swatches: ["#FAFAF9", "#FFFFFF", "#F97316", "#EC4899", "#8B5CF6"],
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm white workspace with a vibrant blaze-orange accent inspired by the brand HTML.",
    fontLabel: "DM Sans",
    swatches: ["#FFF7F0", "#FFFFFF", "#E85D04", "#FF8500", "#FFB87A"],
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Premium dark obsidian background with golden amber highlights.",
    fontLabel: "IBM Plex Sans",
    swatches: ["#0F0700", "#241400", "#FFB347", "#FF8C00", "#FFD199"],
  },
  {
    id: "cyber-tech",
    name: "Cyber Tech",
    description: "Deep navy surfaces with electric cyan and violet — for tech-forward sales.",
    fontLabel: "IBM Plex Sans",
    swatches: ["#0A0E14", "#1A2333", "#00D4FF", "#5B7FFF", "#A855F7"],
  },
  {
    id: "velvet-premium",
    name: "Velvet Premium",
    description: "Deep velvet purple with a luxurious gold accent — premium feel for top accounts.",
    fontLabel: "Space Grotesk",
    swatches: ["#0E0816", "#241C36", "#D4AF37", "#B47AC2", "#7B3FB8"],
  },
  {
    id: "coral-marketing",
    name: "Coral Marketing",
    description: "Bright coral and teal energy — onboarding marketing storytelling for new reps.",
    fontLabel: "Outfit",
    swatches: ["#FFFBF7", "#FFFFFF", "#FF5A36", "#FFB347", "#2EC4B6"],
  },
];

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "theme",
    name: "Theme default",
    description: "Use the font designed for the selected palette.",
    sample: "Adaptive onboarding",
  },
  {
    id: "geist",
    name: "Geist",
    description: "Clean technical UI, close to the original app.",
    sample: "Clear execution",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    description: "Warm, rounded and friendly for ReadySet Light.",
    sample: "Warm guidance",
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    description: "Structured and professional for dense dashboards.",
    sample: "Mentor cockpit",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    description: "Sharper editorial feel for energetic product screens.",
    sample: "Signal clarity",
  },
  {
    id: "outfit",
    name: "Outfit",
    description: "Modern geometric tone for high-contrast themes.",
    sample: "Neon workflow",
  },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function isFontId(value: string | null | undefined): value is FontId {
  return FONT_IDS.includes(value as FontId);
}

export function isCustomColorKey(value: string): value is CustomColorKey {
  return CUSTOM_COLOR_TOKENS.some((token) => token.key === value);
}

export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

export function normalizeHexColor(value: string): string {
  return value.trim().toUpperCase();
}

export function fontFamilyFor(fontId: FontId) {
  switch (fontId) {
    case "dm-sans":
      return "var(--font-dm-sans), var(--font-geist-sans), sans-serif";
    case "ibm-plex-sans":
      return "var(--font-ibm-plex-sans), var(--font-geist-sans), sans-serif";
    case "space-grotesk":
      return "var(--font-space-grotesk), var(--font-geist-sans), sans-serif";
    case "outfit":
      return "var(--font-outfit), var(--font-geist-sans), sans-serif";
    case "geist":
    case "theme":
    default:
      return "var(--font-geist-sans), sans-serif";
  }
}
