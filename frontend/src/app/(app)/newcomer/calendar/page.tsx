"use client";

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/PageHeader";
import { MeetingsList } from "@/components/meetings/MeetingsList";

import { listMeetings } from "@/services/meetings";
import { useDemo } from "@/providers/demo-provider";

export default function NewcomerCalendarPage() {
  const { newcomerId } = useDemo();

  const meetings = useQuery({
    queryKey: ["meetings", "newcomer", newcomerId],
    queryFn: () => listMeetings({ newcomer_id: newcomerId ?? undefined }),
    enabled: !!newcomerId,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Upcoming meetings"
        description="Syncs your mentor has scheduled. Join links open Microsoft Teams when available."
      />

      <MeetingsList
        meetings={meetings.data ?? []}
        isLoading={meetings.isLoading}
        emptyTitle="No meetings yet"
        emptyDescription="Your mentor will schedule sessions here when needed."
      />
    </div>
  );
}
