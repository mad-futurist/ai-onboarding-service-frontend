"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/providers/demo-provider";
import { useTheme } from "@/providers/theme-provider";
import { resetDemo } from "@/services/demo";
import { listSignalCatalog } from "@/services/signals";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CUSTOM_COLOR_TOKENS,
  FONT_OPTIONS,
  THEME_OPTIONS,
  fontFamilyFor,
  isHexColor,
  normalizeHexColor,
  type CustomColorKey,
  type CustomColorOverrides,
  type CustomColorToken,
  type FontOption,
  type ThemeId,
  type ThemeOption,
} from "@/lib/themes";
import type { SignalCatalogGroup, SignalCatalogItem } from "@/types";
import { AlertTriangle, Check, CheckCircle2, OctagonAlert, Palette, RefreshCcw, Settings as SettingsIcon, SlidersHorizontal, Type, Undo2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

export default function SettingsPage() {
  const { refresh, refreshPersonas, mentorName, newcomerName, mentorId, newcomerId, personas } = useDemo();
  const { theme, font, customColors, setTheme, setFont, setCustomColor, resetCustomColors } = useTheme();
  const qc = useQueryClient();
  const [resolvedColors, setResolvedColors] = React.useState<CustomColorOverrides>({});
  const catalogQuery = useQuery({
    queryKey: ["signal-catalog"],
    queryFn: listSignalCatalog,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    const readResolvedColors = () => {
      const styles = window.getComputedStyle(document.documentElement);
      const next: CustomColorOverrides = {};
      for (const token of CUSTOM_COLOR_TOKENS) {
        const value = styles.getPropertyValue(`--color-${token.key}`).trim();
        if (value && isHexColor(value)) {
          next[token.key] = normalizeHexColor(value);
        }
      }
      setResolvedColors(next);
    };

    readResolvedColors();
    const timer = window.setTimeout(readResolvedColors, 0);
    return () => window.clearTimeout(timer);
  }, [customColors, theme]);

  const groupedColorTokens = React.useMemo(() => groupColorTokens(), []);

  const overrideCount = Object.keys(customColors).length;
  const activePalette = THEME_OPTIONS.find((option) => option.id === theme);

  const resetMut = useMutation({
    mutationFn: resetDemo,
    onSuccess: async (seed) => {
      toast.success("Demo database regenerated", {
        description: `Recreated ${seed.personas?.length ?? 3} personas, ${seed.documents_created ?? 0} documents, ${seed.courses_created ?? 0} courses, ${seed.tasks_created ?? 0} tasks and ${seed.meetings_created ?? 0} meetings.`,
      });
      qc.clear();
      sessionStorage.removeItem("onbord.seeded.v1");
      await refreshPersonas();
    },
    onError: (err) => toast.error("Reset failed", { description: toApiError(err).message }),
  });

  const handleRegenerate = () => {
    const ok = window.confirm(
      "Regenerate database will delete all onboarding demo data in this workspace and recreate Oleg, Marina and Tanya. Continue?",
    );
    if (ok) resetMut.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        description="Demo-only settings for the hackathon build."
      />

      <LanguageSwitcher />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[color:var(--color-primary)]" /> Signal catalog
          </CardTitle>
          <CardDescription>
            What the onboarding signal engine can surface today, grouped by outcome.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {catalogQuery.isLoading ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-52 animate-pulse rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]"
                />
              ))}
            </div>
          ) : catalogQuery.isError ? (
            <div className="rounded-lg border border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] p-4 text-sm text-[color:var(--color-danger-fg)]">
              Signal catalog unavailable. Check that the backend exposes /ai-signals/catalog.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {(catalogQuery.data ?? []).map((group) => (
                <SignalCatalogColumn key={group.tone} group={group} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[color:var(--color-primary)]" /> Palette
          </CardTitle>
          <CardDescription>
            Choose the color palette for the whole application. Your choice is saved in this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {THEME_OPTIONS.map((option) => (
              <ThemeChoice
                key={option.id}
                option={option}
                selected={theme === option.id}
                onSelect={() => setTheme(option.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-4 w-4 text-[color:var(--color-primary)]" /> Font
          </CardTitle>
          <CardDescription>
            Pick a font independently from the palette, or keep the default type style of the selected palette.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FONT_OPTIONS.map((option) => (
              <FontChoice
                key={option.id}
                option={option}
                selected={font === option.id}
                currentTheme={theme}
                onSelect={() => setFont(option.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[color:var(--color-primary)]" /> Custom hex palette
              </CardTitle>
              <CardDescription>
                Override any global color with your own hex code. Empty fields fall back to the selected palette.
              </CardDescription>
              <div className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                Editing: <span className="font-semibold text-[color:var(--color-fg)]">{activePalette?.name ?? theme}</span>
                {" · "}
                {overrideCount === 0 ? (
                  <span className="text-[color:var(--color-fg-subtle)]">no overrides on this palette yet</span>
                ) : (
                  <span className="text-[color:var(--color-primary)]">
                    {overrideCount} color{overrideCount === 1 ? "" : "s"} overridden
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={overrideCount === 0}
              onClick={resetCustomColors}
              className={cn(
                overrideCount > 0 &&
                  "border-[color:var(--color-primary)] text-[color:var(--color-primary-active)] hover:bg-[color:var(--color-primary-soft)]",
              )}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Revert this palette to original colors
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4 sm:grid-cols-3">
            <PreviewTile label="Background" color="var(--color-bg)" />
            <PreviewTile label="Surface" color="var(--color-surface)" />
            <PreviewTile label="Primary" color="var(--color-primary)" />
          </div>

          <div className="space-y-6">
            {groupedColorTokens.map(([group, tokens]) => (
              <section key={group} className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  {group}
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {tokens.map((token) => (
                    <ColorTokenEditor
                      key={token.key}
                      token={token}
                      customColors={customColors}
                      resolvedColors={resolvedColors}
                      onChange={setCustomColor}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-[color:var(--color-primary)]" /> Demo data
          </CardTitle>
          <CardDescription>
            Regenerate wipes the demo workspace and recreates the production demo personas, plans, documents, signals and calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="space-y-1 text-sm">
            <Row label="Mentor" value={`${mentorName} (id #${mentorId ?? "—"})`} />
            <Row label="Newcomer" value={`${newcomerName} (id #${newcomerId ?? "—"})`} />
          </dl>
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Viewing as personas
            </div>
            <div className="space-y-1">
              {personas.map((persona) => (
                <div
                  key={`${persona.role}-${persona.user_id}-${persona.newcomer_id ?? "mentor"}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-medium text-[color:var(--color-fg)]">{persona.name}</span>
                  <span className="truncate text-xs text-[color:var(--color-fg-muted)]">
                    {persona.role === "mentor"
                      ? "Mentor"
                      : `${persona.job_title ?? "Newcomer"} · ${persona.team ?? "Team"}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" /> Refresh demo data
          </Button>
          <Button
            variant="ai"
            disabled={resetMut.isPending}
            onClick={handleRegenerate}
            data-demo-id="settings-regenerate"
          >
            <RefreshCcw className="h-4 w-4" /> {resetMut.isPending ? "Regenerating..." : "Regenerate database"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeChoice({
  option,
  selected,
  onSelect,
}: {
  option: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex min-h-[220px] flex-col rounded-xl border bg-[color:var(--color-surface)] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)] hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]",
        selected
          ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary-ring)]"
          : "border-[color:var(--color-border)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {option.swatches.map((swatch) => (
            <span
              key={swatch}
              className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
        <span
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full border text-[color:var(--color-primary-active)] transition",
            selected
              ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] opacity-100"
              : "border-transparent opacity-0 group-hover:opacity-40",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="mt-4 flex-1">
        <div
          className="text-lg font-semibold tracking-tight text-[color:var(--color-fg)]"
          style={{ fontFamily: fontPreview(option.id) }}
        >
          {option.name}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
          {option.description}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3">
        <div
          className="text-sm font-semibold leading-tight text-[color:var(--color-fg)]"
          style={{ fontFamily: fontPreview(option.id) }}
        >
          ReadySet.AI
        </div>
        <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          {option.fontLabel}
        </div>
      </div>
    </button>
  );
}

function FontChoice({
  option,
  selected,
  currentTheme,
  onSelect,
}: {
  option: FontOption;
  selected: boolean;
  currentTheme: ThemeId;
  onSelect: () => void;
}) {
  const family = option.id === "theme" ? fontPreview(currentTheme) : fontFamilyFor(option.id);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group rounded-xl border bg-[color:var(--color-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--color-primary-ring)] hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]",
        selected
          ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary-ring)]"
          : "border-[color:var(--color-border)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[color:var(--color-fg)]">{option.name}</div>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
            {option.description}
          </p>
        </div>
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[color:var(--color-primary-active)] transition",
            selected
              ? "border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] opacity-100"
              : "border-transparent opacity-0 group-hover:opacity-40",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>

      <div
        className="mt-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3 text-[22px] font-semibold leading-tight text-[color:var(--color-fg)]"
        style={{ fontFamily: family }}
      >
        {option.sample}
      </div>
    </button>
  );
}

function ColorTokenEditor({
  token,
  customColors,
  resolvedColors,
  onChange,
}: {
  token: CustomColorToken;
  customColors: CustomColorOverrides;
  resolvedColors: CustomColorOverrides;
  onChange: (key: CustomColorKey, value: string | null) => void;
}) {
  const customValue = customColors[token.key] ?? "";
  const resolvedValue = resolvedColors[token.key] ?? token.fallback;
  const [draft, setDraft] = React.useState(customValue);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDraft(customValue), 0);
    return () => window.clearTimeout(timer);
  }, [customValue]);

  const invalid = draft.length > 0 && !isHexColor(draft);
  const colorValue = isHexColor(customValue) ? customValue : resolvedValue;

  const updateValue = (nextValue: string) => {
    const normalized = nextValue.trim().toUpperCase();
    setDraft(normalized);

    if (!normalized) {
      onChange(token.key, null);
      return;
    }

    if (isHexColor(normalized)) {
      onChange(token.key, normalizeHexColor(normalized));
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">{token.label}</div>
          <div className="truncate text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
            --color-{token.key}
          </div>
        </div>
        <input
          type="color"
          value={colorValue}
          onChange={(event) => updateValue(event.target.value)}
          aria-label={`${token.label} color picker`}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-[color:var(--color-border)] bg-transparent p-1"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => updateValue(event.target.value)}
          placeholder={resolvedValue}
          maxLength={7}
          spellCheck={false}
          className={cn(
            "font-mono uppercase",
            invalid && "border-[color:var(--color-danger)] focus-visible:border-[color:var(--color-danger)]",
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!customValue}
          onClick={() => updateValue("")}
          aria-label={`Revert ${token.label} to palette default`}
          title={customValue ? `Revert ${token.label} to palette default` : "No override on this color"}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>
      {invalid ? (
        <div className="mt-1 text-[11px] text-[color:var(--color-danger-fg)]">Use #RGB or #RRGGBB.</div>
      ) : null}
    </div>
  );
}

function PreviewTile({ label, color }: { label: string; color: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <div className="h-12 rounded-md border border-[color:var(--color-border)]" style={{ background: color }} />
      <div className="mt-2 text-xs font-medium text-[color:var(--color-fg)]">{label}</div>
    </div>
  );
}

function SignalCatalogColumn({ group }: { group: SignalCatalogGroup }) {
  const tone = catalogTone(group.tone);
  const Icon = tone.icon;

  return (
    <section className={cn("rounded-lg border p-4", tone.panelClass)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tone.iconClass)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[color:var(--color-fg)]">{group.label}</div>
          <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">{group.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {group.items.map((item) => (
          <SignalCatalogItemView key={item.signal_type} item={item} />
        ))}
      </div>
    </section>
  );
}

function SignalCatalogItemView({ item }: { item: SignalCatalogItem }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight text-[color:var(--color-fg)]">{item.title}</h3>
          <div className="mt-1 truncate font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            {item.signal_type}
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[color:var(--color-fg-muted)]">
          {item.severity}
        </span>
      </div>
      <dl className="mt-3 space-y-2 text-xs leading-relaxed">
        <SignalCatalogFact label="When" value={item.when} />
        <SignalCatalogFact label="Evidence" value={item.evidence} />
        <SignalCatalogFact label="Action" value={item.suggested_action} />
        <SignalCatalogFact label="MVP trigger" value={item.mvp_trigger} />
      </dl>
    </article>
  );
}

function SignalCatalogFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[color:var(--color-fg)]">{label}</dt>
      <dd className="mt-0.5 text-[color:var(--color-fg-muted)]">{value}</dd>
    </div>
  );
}

function catalogTone(tone: string) {
  switch (tone) {
    case "positive":
      return {
        icon: CheckCircle2,
        panelClass: "border-emerald-500/25 bg-emerald-500/5",
        iconClass: "bg-emerald-500/10 text-emerald-700",
      };
    case "critical":
      return {
        icon: OctagonAlert,
        panelClass: "border-rose-500/25 bg-rose-500/5",
        iconClass: "bg-rose-500/10 text-rose-700",
      };
    default:
      return {
        icon: AlertTriangle,
        panelClass: "border-amber-500/25 bg-amber-500/5",
        iconClass: "bg-amber-500/10 text-amber-700",
      };
  }
}

function fontPreview(themeId: ThemeId) {
  switch (themeId) {
    case "sunset-orange":
      return "var(--font-dm-sans), var(--font-geist-sans), sans-serif";
    case "solar-amber":
    case "cyber-tech":
      return "var(--font-ibm-plex-sans), var(--font-geist-sans), sans-serif";
    case "velvet-premium":
      return "var(--font-space-grotesk), var(--font-geist-sans), sans-serif";
    case "coral-marketing":
      return "var(--font-outfit), var(--font-geist-sans), sans-serif";
    case "current":
    default:
      return "var(--font-geist-sans), sans-serif";
  }
}

function groupColorTokens() {
  const groups = new Map<string, CustomColorToken[]>();
  for (const token of CUSTOM_COLOR_TOKENS) {
    const tokens = groups.get(token.group) ?? [];
    tokens.push(token);
    groups.set(token.group, tokens);
  }
  return Array.from(groups.entries());
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="font-medium text-[color:var(--color-fg)]">{value}</dd>
    </div>
  );
}
