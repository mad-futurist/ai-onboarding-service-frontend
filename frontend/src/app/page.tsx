"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { useDemo } from "@/providers/demo-provider";

export default function LandingPage() {
  const router = useRouter();
  const { ready, role } = useDemo();

  React.useEffect(() => {
    if (!ready) return;
    router.replace(role === "newcomer" ? "/newcomer" : "/mentor");
  }, [ready, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-bg)]">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
        <div className="grid place-items-center h-12 w-12 rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">Loading your workspace…</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)]">
          Connecting to the AI onboarding service and seeding your demo data.
        </p>
      </div>
    </div>
  );
}
