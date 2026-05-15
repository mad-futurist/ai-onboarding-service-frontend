"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Plus, Sparkles, Filter } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseList } from "@/components/mentor/courses/CourseList";

import { listCourses } from "@/services/courses";
import { useDemo } from "@/providers/demo-provider";

export default function CoursesIndexPage() {
  const { mentorId } = useDemo();
  const [status, setStatus] = React.useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["courses", mentorId, status],
    queryFn: () =>
      listCourses({
        mentor_id: mentorId ?? undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Courses"
        title="Onboarding lessons your newcomers can absorb"
        description="Build a tailored mini-curriculum from your knowledge base. AI drafts the outline and each lesson — you stay in full control."
        actions={
          <Button asChild variant="ai">
            <Link href="/mentor/courses/new">
              <Sparkles className="h-4 w-4" /> New course
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Filter className="h-4 w-4 text-[color:var(--color-fg-subtle)]" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[color:var(--color-fg-muted)]">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Spin up a course in seconds — give the AI a prompt and a few sources, and it drafts an outline and every lesson."
          action={
            <Button asChild variant="ai">
              <Link href="/mentor/courses/new">
                <Plus className="h-4 w-4" /> New course
              </Link>
            </Button>
          }
        />
      ) : (
        <CourseList courses={data} />
      )}
    </div>
  );
}
