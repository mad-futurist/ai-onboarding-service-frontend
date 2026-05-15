"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiSuggestField } from "@/services/tasks";
import { toApiError } from "@/lib/api";
import type {
  OnboardingTask,
  TaskExample,
  TaskLink,
  TaskAIField,
  TaskAISuggestResponse,
} from "@/types";

type TaskFormState = {
  title: string;
  description: string;
  task_type: string;
  priority: string;
  success_criteria: string;
  acceptance_criteria: string;
  examples: TaskExample[];
  links: TaskLink[];
};

function toForm(task: OnboardingTask): TaskFormState {
  return {
    title: task.title ?? "",
    description: task.description ?? "",
    task_type: task.task_type ?? "general",
    priority: task.priority ?? "medium",
    success_criteria: task.success_criteria ?? "",
    acceptance_criteria: task.acceptance_criteria ?? "",
    examples: (task.examples ?? []).map((e) => ({
      title: e.title ?? "",
      content: e.content ?? "",
    })),
    links: (task.links ?? []).map((l) => ({ label: l.label ?? "", url: l.url ?? "" })),
  };
}

interface TaskEditorProps {
  task: OnboardingTask;
  onSave: (patch: Partial<TaskFormState>) => Promise<void>;
  saving: boolean;
}

export function TaskEditor({ task, onSave, saving }: TaskEditorProps) {
  const [form, setForm] = React.useState<TaskFormState>(() => toForm(task));
  const [baseline, setBaseline] = React.useState<TaskFormState>(() => toForm(task));
  const [prevTaskId, setPrevTaskId] = React.useState<typeof task.id>(task.id);
  if (prevTaskId !== task.id) {
    const fresh = toForm(task);
    setPrevTaskId(task.id);
    setForm(fresh);
    setBaseline(fresh);
  }

  const aiMut = useMutation({
    mutationFn: ({ field, instruction }: { field: TaskAIField; instruction?: string }) =>
      aiSuggestField(task.id, field, instruction),
  });

  const applyAISuggestion = (field: TaskAIField, resp: TaskAISuggestResponse) => {
    setForm((prev) => {
      if (field === "description" || field === "acceptance_criteria") {
        const suggestion =
          typeof resp.suggestion === "string"
            ? resp.suggestion
            : JSON.stringify(resp.suggestion);
        return { ...prev, [field]: suggestion };
      }
      if (field === "examples") {
        const items = Array.isArray(resp.suggestion)
          ? (resp.suggestion as unknown[]).map((e) => {
              const obj = e as { title?: string; content?: string };
              return { title: obj.title ?? "", content: obj.content ?? "" };
            })
          : [];
        return { ...prev, examples: items };
      }
      if (field === "links") {
        const items = Array.isArray(resp.suggestion)
          ? (resp.suggestion as unknown[]).map((e) => {
              const obj = e as { label?: string; url?: string };
              return { label: obj.label ?? "", url: obj.url ?? "" };
            })
          : [];
        return { ...prev, links: items };
      }
      return prev;
    });
  };

  const askAI = (field: TaskAIField) => {
    aiMut.mutate(
      { field },
      {
        onSuccess: (resp) => {
          applyAISuggestion(field, resp);
          toast.success(`AI suggestion applied to ${field.replace("_", " ")}`);
        },
        onError: (err) =>
          toast.error("AI suggest failed", { description: toApiError(err).message }),
      },
    );
  };

  const handleSave = async () => {
    const patch: Partial<TaskFormState> = {};
    (Object.keys(form) as (keyof TaskFormState)[]).forEach((k) => {
      if (JSON.stringify(form[k]) !== JSON.stringify(baseline[k])) {
        // @ts-expect-error generic over union
        patch[k] = form[k];
      }
    });
    if (Object.keys(patch).length === 0) {
      toast.info("Nothing to save");
      return;
    }
    await onSave(patch);
  };

  const aiBusyFor = (f: TaskAIField) => aiMut.isPending && aiMut.variables?.field === f;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Task</CardTitle>
          <CardDescription>Edit any field manually, or let the AI draft it for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.task_type}
                onValueChange={(v) => setForm({ ...form, task_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="setup">Setup</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <FieldWithAI
            label="Description"
            fieldId="task-desc"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            multiline
            rows={4}
            onAI={() => askAI("description")}
            aiBusy={aiBusyFor("description")}
          />

          <div className="space-y-1.5">
            <Label htmlFor="task-success">Success criteria</Label>
            <Textarea
              id="task-success"
              rows={2}
              placeholder="What does success look like?"
              value={form.success_criteria}
              onChange={(e) => setForm({ ...form, success_criteria: e.target.value })}
            />
          </div>

          <FieldWithAI
            label="Acceptance criteria"
            fieldId="task-accept"
            value={form.acceptance_criteria}
            onChange={(v) => setForm({ ...form, acceptance_criteria: v })}
            multiline
            rows={3}
            onAI={() => askAI("acceptance_criteria")}
            aiBusy={aiBusyFor("acceptance_criteria")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Examples</CardTitle>
              <CardDescription>Concrete patterns the newcomer can copy.</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ai"
              onClick={() => askAI("examples")}
              disabled={aiBusyFor("examples")}
            >
              {aiBusyFor("examples") ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-[color:var(--color-border)] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder="Example title"
                  value={ex.title}
                  onChange={(e) => {
                    const next = [...form.examples];
                    next[i] = { ...next[i], title: e.target.value };
                    setForm({ ...form, examples: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm({ ...form, examples: form.examples.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea
                rows={3}
                placeholder="What does this example show?"
                value={ex.content}
                onChange={(e) => {
                  const next = [...form.examples];
                  next[i] = { ...next[i], content: e.target.value };
                  setForm({ ...form, examples: next });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm({ ...form, examples: [...form.examples, { title: "", content: "" }] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add example
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Links</CardTitle>
              <CardDescription>References, docs, tickets relevant to this task.</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ai"
              onClick={() => askAI("links")}
              disabled={aiBusyFor("links")}
            >
              {aiBusyFor("links") ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.links.map((lk, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
              <Input
                placeholder="Label"
                value={lk.label}
                onChange={(e) => {
                  const next = [...form.links];
                  next[i] = { ...next[i], label: e.target.value };
                  setForm({ ...form, links: next });
                }}
              />
              <Input
                placeholder="https://"
                value={lk.url}
                onChange={(e) => {
                  const next = [...form.links];
                  next[i] = { ...next[i], url: e.target.value };
                  setForm({ ...form, links: next });
                }}
              />
              <div className="flex items-center gap-1">
                {lk.url ? (
                  <a
                    href={lk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-8 w-8 place-items-center rounded text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-surface-muted)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm({ ...form, links: form.links.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm({ ...form, links: [...form.links, { label: "", url: "" }] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add link
          </Button>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
        </Button>
      </div>
    </div>
  );
}

function FieldWithAI({
  label,
  fieldId,
  value,
  onChange,
  multiline,
  rows,
  onAI,
  aiBusy,
}: {
  label: string;
  fieldId: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  onAI: () => void;
  aiBusy: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>{label}</Label>
        <Button type="button" size="sm" variant="soft" onClick={onAI} disabled={aiBusy}>
          {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          AI suggest
        </Button>
      </div>
      {multiline ? (
        <Textarea
          id={fieldId}
          rows={rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input id={fieldId} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
