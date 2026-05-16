"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Settings,
  Home,
  ListChecks,
  LineChart,
  Compass,
  GraduationCap,
  CalendarDays,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { ReadySetLogo } from "@/components/branding/ReadySetLogo";
import { useDemo } from "@/providers/demo-provider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const MENTOR_NAV: NavItem[] = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/newcomers/new", label: "Add newcomer", icon: Users },
  { href: "/mentor/knowledge", label: "Knowledge base", icon: BookOpen },
  { href: "/mentor/plan-generator", label: "AI Plan Generator", icon: Sparkles, badge: "AI" },
  { href: "/mentor/courses", label: "Courses", icon: GraduationCap, badge: "AI" },
  { href: "/mentor/meetings", label: "Calendar", icon: CalendarDays },
  { href: "/mentor/signals", label: "Signals", icon: AlertTriangle },
  { href: "/mentor/settings", label: "Settings", icon: Settings },
];

const NEWCOMER_NAV: NavItem[] = [
  { href: "/newcomer", label: "Home", icon: Home },
  { href: "/newcomer/plan", label: "My plan", icon: ListChecks },
  { href: "/newcomer/courses", label: "Courses", icon: GraduationCap },
  { href: "/newcomer/knowledge", label: "Knowledge", icon: BookOpen, badge: "AI" },
  { href: "/newcomer/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/newcomer/ask", label: "Ask AI", icon: Sparkles, badge: "AI" },
  { href: "/newcomer/signals", label: "Signals", icon: AlertTriangle, badge: "AI" },
  { href: "/newcomer/progress", label: "Progress", icon: LineChart },
];

const SHARED_BOTTOM: NavItem[] = [{ href: "/demo", label: "Demo scenario", icon: Compass }];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-active)] font-medium"
          : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-fg)]",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-fg-muted)]",
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="ai-gradient rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const { role } = useDemo();
  const items = role === "mentor" ? MENTOR_NAV : NEWCOMER_NAV;

  const matchesActive = (href: string) => {
    if (href === pathname) return true;
    if (href === "/mentor" || href === "/newcomer") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-[color:var(--color-border)]">
        <ReadySetLogo size={32} variant="light" title="ReadySet.AI" className="shrink-0" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
            AI onboarding
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
          {role === "mentor" ? "Mentor cockpit" : "Your workspace"}
        </div>
        {items.map((item) => (
          <NavLink key={item.href} item={item} active={matchesActive(item.href)} />
        ))}
      </nav>
      <div className="border-t border-[color:var(--color-border)] px-3 py-3 space-y-1">
        {SHARED_BOTTOM.map((item) => (
          <NavLink key={item.href} item={item} active={matchesActive(item.href)} />
        ))}
        <div className="mt-3 rounded-lg border border-[color:var(--color-primary-ring)] bg-[color:var(--color-primary-soft)] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-primary-active)]">
            <Sparkles className="h-3.5 w-3.5" /> AI copilot
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
            {role === "mentor"
              ? "AI is watching 4 onboardings and will surface signals as they appear."
              : "Stuck on something? Ask AI — it knows your team's docs."}
          </p>
        </div>
      </div>
    </aside>
  );
}
