"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Save,
  Eye,
  PencilLine,
  Loader2,
  FileText,
  ImageIcon,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/shared/Markdown";
import { YouTubeEmbed, extractYouTubeId } from "@/components/shared/YouTubeEmbed";

import { aiGenerateLesson, updateLesson } from "@/services/courses";
import { toApiError } from "@/lib/api";
import type { Lesson, ID } from "@/types";

interface LessonEditorProps {
  courseId: ID;
  lesson: Lesson;
}

export function LessonEditor({ courseId, lesson }: LessonEditorProps) {
  const qc = useQueryClient();
  // Parent passes key={lesson.id}, so the component remounts when the selected
  // lesson changes — state is reinitialized from the new lesson props naturally.
  const [title, setTitle] = React.useState(lesson.title ?? "");
  const [summary, setSummary] = React.useState(lesson.summary ?? "");
  const [body, setBody] = React.useState(lesson.body ?? "");
  const [infographic, setInfographic] = React.useState(lesson.infographic_source ?? "");
  const [videoUrl, setVideoUrl] = React.useState(lesson.video_url ?? "");
  const [view, setView] = React.useState<"edit" | "preview">("edit");

  const trimmedVideo = videoUrl.trim();
  const videoIsValid = !trimmedVideo || !!extractYouTubeId(trimmedVideo);

  const saveMut = useMutation({
    mutationFn: () =>
      updateLesson(lesson.id, {
        title: title.trim(),
        summary: summary.trim() || null,
        body,
        infographic_source: infographic.trim() || null,
        infographic_kind: infographic.trim() ? "mermaid" : null,
        video_url: trimmedVideo || null,
      }),
    onSuccess: () => {
      toast.success("Lesson saved");
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err) => toast.error("Save failed", { description: toApiError(err).message }),
  });

  const aiBodyMut = useMutation({
    mutationFn: () => aiGenerateLesson(courseId, title.trim(), summary.trim() || title.trim()),
    onSuccess: (l) => {
      toast.success("AI rewrote the lesson", {
        description: "A new lesson was generated and appended to the course.",
      });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      // The endpoint creates a new lesson rather than patching, so we hint the user
      void l;
    },
    onError: (err) => toast.error("AI failed", { description: toApiError(err).message }),
  });

  const dirty =
    title !== (lesson.title ?? "") ||
    summary !== (lesson.summary ?? "") ||
    body !== (lesson.body ?? "") ||
    infographic !== (lesson.infographic_source ?? "") ||
    videoUrl !== (lesson.video_url ?? "");

  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label htmlFor="lesson-title" className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                Lesson title
              </Label>
              <Input
                id="lesson-title"
                className="h-11 text-lg font-semibold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ai"
                onClick={() => aiBodyMut.mutate()}
                disabled={aiBodyMut.isPending || !title.trim() || !summary.trim()}
                title={
                  !title.trim() || !summary.trim()
                    ? "Title and summary required for AI"
                    : "Generate a new AI lesson"
                }
              >
                {aiBodyMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate with AI
              </Button>
              <Button
                size="sm"
                onClick={() => saveMut.mutate()}
                disabled={!dirty || saveMut.isPending || !videoIsValid}
              >
                {saveMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save lesson
              </Button>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="lesson-summary">Summary</Label>
            <Input
              id="lesson-summary"
              placeholder="One-line summary the AI will use as guidance."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[color:var(--color-primary)]" /> Body (markdown)
            </CardTitle>
            <CardDescription>
              Write or paste markdown. Switch to Preview to see the rendered lesson.
            </CardDescription>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="edit" className="gap-1.5">
                <PencilLine className="h-3 w-3" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5">
                <Eye className="h-3 w-3" /> Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {view === "edit" ? (
            <Textarea
              rows={20}
              placeholder="# Section title&#10;&#10;Write content using **markdown**. Use lists, code blocks, tables — all supported."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-[13px] leading-relaxed"
            />
          ) : (
            <div className="min-h-[200px] rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5">
              {body.trim() ? (
                <Markdown>{body}</Markdown>
              ) : (
                <p className="text-sm italic text-[color:var(--color-fg-muted)]">
                  Nothing to preview yet — write something in Edit mode.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[color:var(--color-primary)]" /> YouTube video (optional)
          </CardTitle>
          <CardDescription>
            Paste a YouTube link (youtu.be/… or youtube.com/watch?v=…). It will appear embedded in the lesson on the newcomer side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="https://www.youtube.com/watch?v=…"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            aria-invalid={!videoIsValid}
          />
          {!videoIsValid ? (
            <p className="text-xs text-[color:var(--color-danger-fg)]">
              That doesn&apos;t look like a valid YouTube URL.
            </p>
          ) : null}
          {trimmedVideo && videoIsValid ? (
            <div className="pt-1">
              <YouTubeEmbed url={trimmedVideo} title={title} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[color:var(--color-primary)]" /> Infographic (Mermaid)
          </CardTitle>
          <CardDescription>
            Optional Mermaid diagram for the lesson. Paste raw Mermaid source — it&apos;s rendered on the
            newcomer&apos;s side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            placeholder="flowchart LR&#10;  A[Start] --> B[Step 1]"
            value={infographic}
            onChange={(e) => setInfographic(e.target.value)}
            className="font-mono text-[13px] leading-relaxed"
          />
        </CardContent>
      </Card>
    </div>
  );
}
