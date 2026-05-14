"use client";

import { useRouter } from "next/navigation";
import { Users, Sparkles, ChevronDown } from "lucide-react";

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

export function RoleSwitcher() {
  const router = useRouter();
  const { role, setRole, mentorName, newcomerName } = useDemo();

  const handleSwitch = (next: "mentor" | "newcomer") => {
    setRole(next);
    router.push(next === "mentor" ? "/mentor" : "/newcomer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-white px-3 h-9 text-sm font-medium text-[color:var(--color-fg)] shadow-sm transition-colors hover:bg-[color:var(--color-surface-muted)]",
          )}
        >
          <span className="text-[color:var(--color-fg-subtle)]">Viewing as</span>
          <span className="font-semibold capitalize">{role}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch persona</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => handleSwitch("mentor")}
          className={cn(role === "mentor" && "bg-[color:var(--color-primary-soft)]")}
        >
          <Users className="h-4 w-4 text-[color:var(--color-primary)]" />
          <div className="flex-1">
            <div className="text-sm font-medium">Mentor</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">{mentorName}</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => handleSwitch("newcomer")}
          className={cn(role === "newcomer" && "bg-[color:var(--color-primary-soft)]")}
        >
          <Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" />
          <div className="flex-1">
            <div className="text-sm font-medium">Newcomer</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">{newcomerName}</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-[color:var(--color-fg-subtle)]">
          For the demo, switch between the mentor cockpit and the newcomer workspace.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
