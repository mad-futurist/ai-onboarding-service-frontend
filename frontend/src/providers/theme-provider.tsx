"use client";

import * as React from "react";

import {
  DEFAULT_FONT_ID,
  DEFAULT_THEME_ID,
  CUSTOM_COLOR_STORAGE_KEY,
  CUSTOM_COLOR_TOKENS,
  FONT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isCustomColorKey,
  isFontId,
  isThemeId,
  isHexColor,
  normalizeHexColor,
  type CustomColorKey,
  type CustomColorOverrides,
  type FontId,
  type ThemeId,
} from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  font: FontId;
  customColors: CustomColorOverrides;
  setTheme: (theme: ThemeId) => void;
  setFont: (font: FontId) => void;
  setCustomColor: (key: CustomColorKey, value: string | null) => void;
  resetCustomColors: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeId(stored) ? stored : DEFAULT_THEME_ID;
}

function getStoredFont(): FontId {
  if (typeof window === "undefined") return DEFAULT_FONT_ID;

  const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
  return isFontId(stored) ? stored : DEFAULT_FONT_ID;
}

function getStoredCustomColors(): CustomColorOverrides {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CUSTOM_COLOR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const colors: CustomColorOverrides = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (isCustomColorKey(key) && typeof value === "string" && isHexColor(value)) {
        colors[key] = normalizeHexColor(value);
      }
    }

    return colors;
  } catch {
    return {};
  }
}

const DARK_THEMES: ThemeId[] = ["solar-amber", "cyber-tech", "velvet-premium"];

function applyAppearance(theme: ThemeId, font: FontId) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.font = font;
  document.documentElement.style.colorScheme = DARK_THEMES.includes(theme) ? "dark" : "light";
}

function applyCustomColors(colors: CustomColorOverrides) {
  for (const token of CUSTOM_COLOR_TOKENS) {
    const value = colors[token.key];
    if (value) {
      document.documentElement.style.setProperty(`--color-${token.key}`, value);
    } else {
      document.documentElement.style.removeProperty(`--color-${token.key}`);
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeId>(DEFAULT_THEME_ID);
  const [font, setFontState] = React.useState<FontId>(DEFAULT_FONT_ID);
  const [customColors, setCustomColors] = React.useState<CustomColorOverrides>({});
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setThemeState(getStoredTheme());
      setFontState(getStoredFont());
      setCustomColors(getStoredCustomColors());
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    applyAppearance(theme, font);
    applyCustomColors(customColors);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(FONT_STORAGE_KEY, font);
    window.localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, JSON.stringify(customColors));
  }, [customColors, font, ready, theme]);

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isThemeId(event.newValue)) {
        setThemeState(event.newValue);
      }
      if (event.key === FONT_STORAGE_KEY && isFontId(event.newValue)) {
        setFontState(event.newValue);
      }
      if (event.key === CUSTOM_COLOR_STORAGE_KEY) {
        setCustomColors(getStoredCustomColors());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setCustomColor = React.useCallback((key: CustomColorKey, value: string | null) => {
    setCustomColors((current) => {
      const next = { ...current };
      if (value && isHexColor(value)) {
        next[key] = normalizeHexColor(value);
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const resetCustomColors = React.useCallback(() => {
    setCustomColors({});
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      font,
      customColors,
      setTheme: setThemeState,
      setFont: setFontState,
      setCustomColor,
      resetCustomColors,
    }),
    [customColors, font, resetCustomColors, setCustomColor, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
