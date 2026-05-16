"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveAssessmentForNewcomer,
  getAssessmentSubmission,
} from "@/services/assessments";
import { useDemo } from "@/providers/demo-provider";
import { useLocale } from "@/providers/locale-provider";
import { AssessmentRunner } from "@/components/newcomer/assessment/AssessmentRunner";

export default function NewcomerAssessmentPage() {
  const { newcomerId } = useDemo();
  const { t } = useLocale();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["newcomer-assessment", newcomerId],
    queryFn: () => getActiveAssessmentForNewcomer(newcomerId!),
    enabled: !!newcomerId,
  });

  const { data: submission } = useQuery({
    queryKey: ["newcomer-assessment-submission", assessment?.id],
    queryFn: () => getAssessmentSubmission(assessment!.id),
    enabled: !!assessment,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!assessment || !newcomerId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">No skill check waiting.</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)]">
          Once your mentor publishes a skill check, you&apos;ll see it here.
        </p>
        <Button asChild variant="ghost">
          <Link href="/newcomer">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (submission?.submitted_at) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">
          {t("assessment.runner.alreadyDone.title")}
        </h1>
        <p className="text-sm text-[color:var(--color-fg-muted)]">
          {t("assessment.runner.alreadyDone.body")}
        </p>
        <Button asChild variant="ai">
          <Link href="/newcomer">
            <ArrowLeft className="h-4 w-4" /> {t("assessment.runner.backToDashboard")}
          </Link>
        </Button>
      </div>
    );
  }

  return <AssessmentRunner assessment={assessment} newcomerId={newcomerId} />;
}
