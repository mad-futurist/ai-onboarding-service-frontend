"use client";

import * as React from "react";
import { Globe } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/i18n/messages";
import { useLocale } from "@/providers/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[color:var(--color-primary)]" />
          {t("settings.language.label")}
        </CardTitle>
        <CardDescription>{t("settings.language.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {LOCALES.map((opt) => {
            const selected = locale === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLocale(opt.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-primary-ring)]",
                )}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-xs font-semibold text-[color:var(--color-fg-muted)]"
                  aria-hidden
                >
                  {opt.shortLabel}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[color:var(--color-fg)]">
                    {opt.label}
                  </div>
                  <div className="text-xs text-[color:var(--color-fg-muted)]">
                    {opt.shortLabel}
                  </div>
                </div>
                {selected ? (
                  <span className="text-xs font-semibold text-[color:var(--color-primary-active)]">
                    {t("settings.language.active")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
