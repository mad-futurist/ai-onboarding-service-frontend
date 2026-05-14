export const APP_NAME = "Onbord";
export const APP_TAGLINE = "AI onboarding for teams that hire well";

export type Role = "mentor" | "newcomer";

export const ROLE_LABEL: Record<Role, string> = {
  mentor: "Mentor",
  newcomer: "Newcomer",
};

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "ai";

export const STATUS_LABEL: Record<string, string> = {
  on_track: "On track",
  needs_attention: "Needs attention",
  blocked: "Blocked",
  draft: "Draft",
  approved: "Approved",
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  done: "Done",
  todo: "To do",
  not_started: "Not started",
  plan_generated: "Plan generated",
  open: "Open",
  resolved: "Resolved",
  ignored: "Ignored",
  active: "Active",
};

export const STATUS_TONE: Record<string, StatusTone> = {
  on_track: "success",
  approved: "success",
  done: "success",
  completed: "success",
  resolved: "neutral",
  needs_attention: "warning",
  in_progress: "warning",
  draft: "warning",
  pending: "warning",
  todo: "neutral",
  not_started: "neutral",
  blocked: "danger",
  open: "warning",
  ignored: "neutral",
  active: "info",
  plan_generated: "info",
};

export const SEVERITY_TONE: Record<string, StatusTone> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export const PRIORITY_TONE: Record<string, StatusTone> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

export const SIGNAL_TYPE_LABEL: Record<string, string> = {
  lack_of_engagement: "Low engagement",
  blocked_task: "Blocked task",
  confusion: "Topic confusion",
  deployment_confusion: "Deployment confusion",
  access_issue: "Access issue",
  hr_question: "HR question",
  repeated_question: "Repeated question",
  documentation_gap: "Documentation gap",
};

export function humanizeSignalType(type: string): string {
  return (
    SIGNAL_TYPE_LABEL[type] ??
    type
      .split("_")
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
  );
}
