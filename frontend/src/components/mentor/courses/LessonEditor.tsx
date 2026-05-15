"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type SectionKey = "overview" | "body" | "video" | "infographic";

const SECTION_STORAGE = "mentor.lesson.section";

function loadSectionOpen(key: SectionKey): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(`${SECTION_STORAGE}.${key}`);
    return raw == null ? true : raw === "1";
  } catch {
    return true;
  }
}

function saveSectionOpen(key: SectionKey, open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${SECTION_STORAGE}.${key}`, open ? "1" : "0");
  } catch {
    // ignore
  }
}

export function LessonEditor({ courseId, lesson }: LessonEditorProps) {
  const qc = useQueryClient();
  const [title, setTitle] = React.useState(lesson.title ?? "");
  const [summary, setSummary] = React.useState(lesson.summary ?? "");
  const [body, setBody] = React.useState(lesson.body ?? "");
  const [infographic, setInfographic] = React.useState(lesson.infographic_source ?? "");
  const [videoUrl, setVideoUrl] = React.useState(lesson.video_url ?? "");
  const [view, setView] = React.useState<"edit" | "preview">("edit");

  const [overviewOpen, setOverviewOpen] = React.useState(() => loadSectionOpen("overview"));
  const [bodyOpen, setBodyOpen] = React.useState(() => loadSectionOpen("body"));
  const [videoOpen, setVideoOpen] = React.useState(() => loadSectionOpen("video"));
  const [infoOpen, setInfoOpen] = React.useState(() => loadSectionOpen("infographic"));

  const toggle = (key: SectionKey) => {
    if (key === "overview") setOverviewOpen((v) => (saveSectionOpen(key, !v), !v));
    if (key === "body") setBodyOpen((v) => (saveSectionOpen(key, !v), !v));
    if (key === "video") setVideoOpen((v) => (saveSectionOpen(key, !v), !v));
    if (key === "infographic") setInfoOpen((v) => (saveSectionOpen(key, !v), !v));
  };

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
      <section className="relative overflow-hidden rounded-[18px] glass-card p-4 sm:p-5">
        <span aria-hidden className="absolute inset-x-0 top-0 h-px ai-gradient" />
        <SectionHeader
          icon={<Sparkles className="h-4 w-4 text-[color:var(--color-primary)]" />}
          title="Overview"
          description="Title and one-line summary the AI uses as guidance."
          open={overviewOpen}
          onToggle={() => toggle("overview")}
          extra={
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
                className={cn(dirty && "glow-ring")}
                data-active={dirty ? "true" : undefined}
              >
                {saveMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save lesson
              </Button>
            </div>
          }
        />
        <Collapsible open={overviewOpen}>
          <div className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="lesson-title"
                className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]"
              >
                Lesson title
              </Label>
              <Input
                id="lesson-title"
                className="h-11 text-lg font-semibold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-summary">Summary</Label>
              <Input
                id="lesson-summary"
                placeholder="One-line summary the AI will use as guidance."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>
        </Collapsible>
      </section>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <SectionHeader
            icon={<FileText className="h-4 w-4 text-[color:var(--color-primary)]" />}
            title="Body (markdown)"
            description="Write or paste markdown. Switch to Preview to see the rendered lesson."
            open={bodyOpen}
            onToggle={() => toggle("body")}
            extra={
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
            }
          />
          <Collapsible open={bodyOpen}>
            <div className="pt-3">
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
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <SectionHeader
            icon={<Video className="h-4 w-4 text-[color:var(--color-primary)]" />}
            title="YouTube video (optional)"
            description="Paste a YouTube link (youtu.be/… or youtube.com/watch?v=…). It will appear embedded in the lesson on the newcomer side."
            open={videoOpen}
            onToggle={() => toggle("video")}
          />
          <Collapsible open={videoOpen}>
            <div className="space-y-3 pt-3">
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
                <div className="glow-ring rounded-xl pt-1">
                  <YouTubeEmbed url={trimmedVideo} title={title} />
                </div>
              ) : null}
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <SectionHeader
            icon={<ImageIcon className="h-4 w-4 text-[color:var(--color-primary)]" />}
            title="Infographic (Mermaid)"
            description="Optional Mermaid diagram for the lesson. Paste raw Mermaid source — it's rendered on the newcomer's side."
            open={infoOpen}
            onToggle={() => toggle("infographic")}
          />
          <Collapsible open={infoOpen}>
            <div className="pt-3">
              <Textarea
                rows={6}
                placeholder="flowchart LR&#10;  A[Start] --> B[Step 1]"
                value={infographic}
                onChange={(e) => setInfographic(e.target.value)}
                className="font-mono text-[13px] leading-relaxed"
              />
            </div>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  open,
  onToggle,
  extra,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-1 min-w-0 items-start gap-2 text-left"
        aria-expanded={open}
      >
        <span className="mt-0.5">{icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[color:var(--color-fg)]">
            <span>{title}</span>
            <motion.span
              animate={{ rotate: open ? 0 : -90 }}
              transition={{ duration: 0.18 }}
              className="text-[color:var(--color-fg-faint)]"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </div>
          {description ? (
            <p className="text-xs text-[color:var(--color-fg-muted)]">{description}</p>
          ) : null}
        </div>
      </button>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </div>
  );
}

function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="open"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
