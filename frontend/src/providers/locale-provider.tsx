"use client";

import * as React from "react";

import {
  formatMessage,
  MESSAGES,
  UI_TRANSLATIONS_UK,
  type Locale,
} from "@/i18n/messages";

const STORAGE_KEY = "onbord.locale.v1";
const DEFAULT_LOCALE: Locale = "uk";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "uk") return stored;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);
  const textOriginalsRef = React.useRef<WeakMap<Text, string>>(new WeakMap());

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setLocaleState(getStoredLocale());
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
      const template = dict[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
      return formatMessage(template, vars);
    },
    [locale],
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.lang = locale;

    const textOriginals = textOriginalsRef.current;
    let applying = false;
    let frame = 0;

    const translate = (value: string) =>
      locale === "uk" ? translateUiString(value) : value;

    const translateElementAttributes = (element: Element) => {
      for (const attr of TRANSLATABLE_ATTRIBUTES) {
        const current = element.getAttribute(attr);
        const originalAttr = `data-ui-original-${attr}`;
        const stored = element.getAttribute(originalAttr);

        if (locale === "uk") {
          if (current == null) continue;
          const translatedStored = stored ? translateUiString(stored) : null;
          const original =
            stored && current !== stored && current !== translatedStored
              ? current
              : stored ?? current;
          if (!stored) element.setAttribute(originalAttr, original);
          else if (original !== stored) element.setAttribute(originalAttr, original);
          const translated = translate(original);
          if (current !== translated) element.setAttribute(attr, translated);
        } else if (stored != null) {
          const translatedStored = translateUiString(stored);
          if (current === translatedStored) {
            element.setAttribute(attr, stored);
          } else if (current != null && current !== stored) {
            element.setAttribute(originalAttr, current);
          }
          element.removeAttribute(originalAttr);
        }
      }
    };

    const translateTextNode = (node: Text) => {
      const current = node.nodeValue ?? "";
      const stored = textOriginals.get(node);

      if (locale === "uk") {
        const translatedStored = stored ? translateUiString(stored) : null;
        const original =
          stored && current !== stored && current !== translatedStored
            ? current
            : stored ?? current;
        textOriginals.set(node, original);
        const translated = translate(original);
        if (current !== translated) node.nodeValue = translated;
        return;
      }

      if (!stored) return;
      const translatedStored = translateUiString(stored);
      if (current === translatedStored) {
        if (current !== stored) node.nodeValue = stored;
      } else if (current !== stored) {
        textOriginals.set(node, current);
      }
    };

    const applyTranslations = () => {
      applying = true;
      translateElementAttributes(document.documentElement);

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            const parent =
              node.nodeType === Node.TEXT_NODE
                ? node.parentElement
                : node instanceof Element
                  ? node
                  : null;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.closest("script, style, textarea, code, pre")) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        },
      );

      let node: Node | null = walker.currentNode;
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node as Text);
        } else if (node instanceof Element) {
          translateElementAttributes(node);
        }
        node = walker.nextNode();
      }

      applying = false;
    };

    const scheduleTranslations = () => {
      if (applying || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyTranslations();
      });
    };

    applyTranslations();

    const observer = new MutationObserver(scheduleTranslations);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

const TRANSLATABLE_ATTRIBUTES = [
  "aria-label",
  "placeholder",
  "title",
] as const;

function translateUiString(value: string): string {
  if (!value.trim()) return value;

  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const text = value.trim().replace(/\u00a0/g, " ");
  const normalized = normalizeUiText(text);
  const translated =
    UI_TRANSLATIONS_UK[text] ??
    UI_TRANSLATIONS_UK[normalized] ??
    translateSharedTerms(normalized);

  return `${leading}${translated}${trailing}`;
}

function normalizeUiText(value: string): string {
  return value
    .replaceAll("…", "...")
    .replaceAll("—", "-")
    .replace(/\s+/g, " ")
    .trim();
}

function translateSharedTerms(value: string): string {
  return value
    .replace(/\bViewing as\b/g, "Перегляд як")
    .replace(/\bDeployment\b/g, "Розгортання")
    .replace(/\bdeployment\b/g, "розгортання")
    .replace(/\bOnboarding\b/g, "Онбординг")
    .replace(/\bonboarding\b/g, "онбординг")
    .replace(/\bonboardings\b/g, "онбординги")
    .replace(/\bMentor\b/g, "Ментор")
    .replace(/\bmentor\b/g, "ментор")
    .replace(/\bNewcomer\b/g, "Новачок")
    .replace(/\bnewcomer\b/g, "новачок")
    .replace(/\bnewcomers\b/g, "новачки")
    .replace(/\bDashboard\b/g, "Панель")
    .replace(/\bdashboard\b/g, "панель")
    .replace(/\bSettings\b/g, "Налаштування")
    .replace(/\bsettings\b/g, "налаштування")
    .replace(/\bKnowledge base\b/g, "База знань")
    .replace(/\bknowledge base\b/g, "база знань")
    .replace(/\bDocuments\b/g, "Документи")
    .replace(/\bdocuments\b/g, "документи")
    .replace(/\bDocs\b/g, "Документи")
    .replace(/\bdocs\b/g, "документи")
    .replace(/\bCourses\b/g, "Курси")
    .replace(/\bcourses\b/g, "курси")
    .replace(/\bCourse\b/g, "Курс")
    .replace(/\bcourse\b/g, "курс")
    .replace(/\bTasks\b/g, "Завдання")
    .replace(/\btasks\b/g, "завдання")
    .replace(/\bTask\b/g, "Завдання")
    .replace(/\btask\b/g, "завдання")
    .replace(/\bSignals\b/g, "Сигнали")
    .replace(/\bsignals\b/g, "сигнали")
    .replace(/\bSignal\b/g, "Сигнал")
    .replace(/\bsignal\b/g, "сигнал")
    .replace(/\bCalendar\b/g, "Календар")
    .replace(/\bcalendar\b/g, "календар")
    .replace(/\bProgress\b/g, "Прогрес")
    .replace(/\bprogress\b/g, "прогрес")
    .replace(/\bPlan\b/g, "План")
    .replace(/\bplan\b/g, "план");
}

export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    // Provide a safe fallback so the app doesn't crash if used outside provider
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, vars) =>
        formatMessage(MESSAGES[DEFAULT_LOCALE][key] ?? key, vars),
    };
  }
  return ctx;
}
