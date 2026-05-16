"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Users, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemo } from "@/providers/demo-provider";
import { cn } from "@/lib/utils";
import type { DemoPersona } from "@/types";

export function RoleSwitcher() {
  const router = useRouter();
  const {
    role,
    mentorId,
    newcomerId,
    mentorName,
    newcomerName,
    personas,
    selectPersona,
  } = useDemo();

  const activeName = role === "mentor" ? mentorName : newcomerName;

  const handleSwitch = (persona: DemoPersona) => {
    selectPersona(persona);
    router.push(persona.role === "mentor" ? "/mentor" : "/newcomer");
  };

  const isActive = (persona: DemoPersona) => {
    if (persona.role === "mentor") {
      return role === "mentor" && persona.user_id === mentorId;
    }
    return role === "newcomer" && persona.newcomer_id === newcomerId;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 text-sm font-medium text-[color:var(--color-fg)] shadow-sm transition-colors hover:bg-[color:var(--color-surface-muted)]",
          )}
        >
          <span className="text-[color:var(--color-fg-subtle)]">Viewing as</span>
          <span className="max-w-36 truncate font-semibold">{activeName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Switch persona</DropdownMenuLabel>
        {personas.map((persona) => {
          const Icon = persona.role === "mentor" ? Users : Sparkles;
          return (
            <DropdownMenuItem
              key={`${persona.role}-${persona.user_id}-${persona.newcomer_id ?? "mentor"}`}
              onSelect={() => handleSwitch(persona)}
              className={cn(
                "items-start gap-3",
                isActive(persona) && "bg-[color:var(--color-primary-soft)]",
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 text-[color:var(--color-primary)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{persona.name}</div>
                <div className="truncate text-xs text-[color:var(--color-fg-muted)]">
                  {persona.role === "mentor"
                    ? "Mentor"
                    : `${persona.job_title ?? "Newcomer"} · ${persona.team ?? "Team"}`}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-[color:var(--color-fg-subtle)]">
          For the demo, jump between the mentor cockpit and each newcomer workspace.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
