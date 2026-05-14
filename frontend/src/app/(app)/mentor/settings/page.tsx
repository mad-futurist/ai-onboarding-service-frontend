"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/providers/demo-provider";
import { RefreshCcw, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { refresh, mentorName, newcomerName, mentorId, newcomerId } = useDemo();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        description="Demo-only settings for the hackathon build."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-[color:var(--color-primary)]" /> Demo data
          </CardTitle>
          <CardDescription>
            The demo workspace is seeded once per session. Refresh to wipe local state and pull fresh IDs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="space-y-1 text-sm">
            <Row label="Mentor" value={`${mentorName} (id #${mentorId ?? "—"})`} />
            <Row label="Newcomer" value={`${newcomerName} (id #${newcomerId ?? "—"})`} />
          </dl>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" /> Refresh demo data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--color-fg-subtle)]">{label}</dt>
      <dd className="font-medium text-[color:var(--color-fg)]">{value}</dd>
    </div>
  );
}
