import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, IBM_Plex_Sans, Outfit, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";
import { DemoProvider } from "@/providers/demo-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CUSTOM_COLOR_STORAGE_KEY,
  CUSTOM_COLOR_TOKENS,
  DEFAULT_FONT_ID,
  DEFAULT_THEME_ID,
  FONT_IDS,
  FONT_STORAGE_KEY,
  THEME_IDS,
  THEME_STORAGE_KEY,
} from "@/lib/themes";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ReadySet.AI - AI-онбординг для команд продажів",
  description:
    "AI-онбординг для нових співробітників. Ментори генерують персоналізовані плани 30/60/90, виявляють перешкоди й адаптують шлях, а новачки отримують відповіді з джерелами.",
};

const themeScript = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var fontKey = ${JSON.stringify(FONT_STORAGE_KEY)};
    var colorKey = ${JSON.stringify(CUSTOM_COLOR_STORAGE_KEY)};
    var themes = ${JSON.stringify(THEME_IDS)};
    var fonts = ${JSON.stringify(FONT_IDS)};
    var colorTokens = ${JSON.stringify(CUSTOM_COLOR_TOKENS.map((token) => token.key))};
    var fallback = ${JSON.stringify(DEFAULT_THEME_ID)};
    var fontFallback = ${JSON.stringify(DEFAULT_FONT_ID)};
    var theme = window.localStorage.getItem(key);
    var font = window.localStorage.getItem(fontKey);
    if (themes.indexOf(theme) === -1) theme = fallback;
    if (fonts.indexOf(font) === -1) font = fontFallback;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.font = font;
    var darkThemes = ["solar-amber", "cyber-tech", "velvet-premium"];
    document.documentElement.style.colorScheme =
      darkThemes.indexOf(theme) !== -1 ? "dark" : "light";
    var rawColors = window.localStorage.getItem(colorKey);
    var colors = rawColors ? JSON.parse(rawColors) : {};
    var hex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    colorTokens.forEach(function (token) {
      var value = colors[token];
      if (typeof value === "string" && hex.test(value)) {
        document.documentElement.style.setProperty("--color-" + token, value);
      }
    });
  } catch (error) {
    document.documentElement.dataset.theme = ${JSON.stringify(DEFAULT_THEME_ID)};
    document.documentElement.dataset.font = ${JSON.stringify(DEFAULT_FONT_ID)};
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      data-theme={DEFAULT_THEME_ID}
      data-font={DEFAULT_FONT_ID}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${ibmPlexSans.variable} ${spaceGrotesk.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
        <ThemeProvider>
          <LocaleProvider>
            <QueryProvider>
              <DemoProvider>
                <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
              </DemoProvider>
            </QueryProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "rounded-xl border shadow-[var(--shadow-elevated)]",
            },
          }}
        />
      </body>
    </html>
  );
}
