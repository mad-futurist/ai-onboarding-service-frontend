"use client";

import * as React from "react";

import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";
import { useDemo } from "@/providers/demo-provider";
import { Sparkles } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, seeding, error } = useDemo();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0">
          {seeding && !ready ? (
            <BootstrapState />
          ) : error ? (
            <BackendError message={error} />
          ) : (
            <div className="animate-fade-up">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}

function BootstrapState() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="relative grid place-items-center h-12 w-12 rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <h2 className="text-base font-semibold tracking-tight">Spinning up your demo workspace...</h2>
        <p className="text-sm text-[color:var(--color-fg-muted)]">
          Seeding mentors, newcomers, knowledge base and AI signals. This only happens once.
        </p>
      </div>
    </div>
  );
}

function BackendError({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-md rounded-2xl border border-[color:var(--color-danger-soft)] bg-[color:var(--color-surface)] p-6">
        <div className="text-sm font-semibold text-[color:var(--color-danger-fg)]">Cannot reach the backend</div>
        <p className="mt-1.5 text-sm text-[color:var(--color-fg-muted)]">{message}</p>
        <p className="mt-3 text-xs text-[color:var(--color-fg-subtle)]">
          Make sure the FastAPI backend is reachable at{" "}
          <code className="rounded bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px]">
            {backendUrl}
          </code>
          . The frontend calls{" "}
          <code className="rounded bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px]">
            {apiBase}/*
          </code>
          ; when using{" "}
          <code className="rounded bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px]">/api</code>,
          Next proxies it to the backend without adding an extra{" "}
          <code className="rounded bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px]">/api</code>{" "}
          prefix.
        </p>
      </div>
    </div>
  );
}
