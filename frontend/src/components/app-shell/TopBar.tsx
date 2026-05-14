"use client";

import { Search, Sparkles, BellRing } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleSwitcher } from "@/components/app-shell/RoleSwitcher";
import { useDemo } from "@/providers/demo-provider";
import { getInitials } from "@/lib/utils";

export function TopBar() {
  const { role, mentorName, newcomerName } = useDemo();
  const activeName = role === "mentor" ? mentorName : newcomerName;
  const greeting = role === "mentor" ? "Mentor cockpit" : "Your onboarding";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[color:var(--color-border)] bg-white/85 backdrop-blur px-4 sm:px-6">
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          {greeting}
        </span>
        <span className="text-sm font-semibold tracking-tight">{activeName}</span>
      </div>

      <div className="hidden md:flex relative ml-6 max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-fg-faint)]" />
        <input
          placeholder={role === "mentor" ? "Search newcomers, signals, docs…" : "Search your plan, docs, people…"}
          className="h-9 w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/60 pl-9 pr-3 text-sm placeholder:text-[color:var(--color-fg-faint)] focus-visible:outline-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-ring)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-primary-active)]">
          <Sparkles className="h-3.5 w-3.5" />
          AI live
        </div>
        <RoleSwitcher />
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-[color:var(--color-border)] bg-white text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)] transition-colors">
          <BellRing className="h-4 w-4" />
        </button>
        <Avatar>
          <AvatarFallback>{getInitials(activeName)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
