"use client";

import * as React from "react";
import { Clock } from "lucide-react";

interface SessionTimerProps {
  startedAt: string | Date;
}

export function SessionTimer({ startedAt }: SessionTimerProps) {
  const start = React.useMemo(
    () => (typeof startedAt === "string" ? new Date(startedAt) : startedAt),
    [startedAt],
  );
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const seconds = Math.max(0, Math.floor((now - start.getTime()) / 1000));
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs tabular-nums text-[color:var(--color-fg-muted)]">
      <Clock className="h-3.5 w-3.5" />
      {mins}:{secs}
    </div>
  );
}
