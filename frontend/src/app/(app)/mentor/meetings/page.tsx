"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { ScheduleMeetingDialog } from "@/components/meetings/ScheduleMeetingDialog";

import { listMeetings } from "@/services/meetings";
import { useDemo } from "@/providers/demo-provider";

export default function MentorMeetingsPage() {
  const { mentorId } = useDemo();
  const [open, setOpen] = React.useState(false);

  const meetings = useQuery({
    queryKey: ["meetings", "organizer", mentorId],
    queryFn: () => listMeetings({ organizer_user_id: mentorId ?? undefined }),
    enabled: !!mentorId,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Meetings"
        title="Mentor calendar"
        description="Your scheduled syncs with newcomers. Phase 4 will add Microsoft Graph OAuth so Teams URLs and Outlook invites are generated automatically."
        actions={
          <Button variant="ai" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New meeting
          </Button>
        }
      />

      <MeetingsList
        meetings={meetings.data ?? []}
        isLoading={meetings.isLoading}
        emptyTitle="No meetings scheduled"
        emptyDescription="Click 'New meeting' to plan a sync, or schedule one from a signal."
        showDelete
      />

      <ScheduleMeetingDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
