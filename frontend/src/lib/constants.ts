export const APP_NAME = "ReadySet.AI";
export const APP_TAGLINE = "AI onboarding for sales teams that ramp fast";

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
  in_review: "In review",
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
  in_review: "info",
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
  fast_completion: "Fast completion",
  steady_progress: "Steady progress",
  plan_stall: "Plan stall risk",
  empty_plan_blocker: "Missing onboarding plan",
  deployment_heavy_plan: "Deployment-heavy plan",
  hr_friction: "HR friction",
  access_friction: "Access friction",
  deployment_friction: "Deployment friction",
  code_review_friction: "Code review friction",
  testing_friction: "Testing friction",
  architecture_friction: "Architecture friction",
  jira_workflow_friction: "Jira workflow friction",
  knowledge_friction: "Knowledge friction",
};

export type SignalToneTone = "positive" | "attention" | "critical";

export const SIGNAL_TONE_LABEL: Record<string, string> = {
  positive: "Good signal",
  attention: "Needs attention",
  critical: "Critical",
};

export const SIGNAL_TONE_DOT: Record<string, string> = {
  positive: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-rose-500",
};

export function inferSignalTone(signal: {
  tone?: string | null;
  severity?: string;
  signal_type?: string;
}): "positive" | "attention" | "critical" {
  const explicit = (signal.tone ?? "").toLowerCase();
  if (explicit === "positive" || explicit === "attention" || explicit === "critical") {
    return explicit;
  }
  if (signal.signal_type === "fast_completion") return "positive";
  const sev = (signal.severity ?? "").toLowerCase();
  if (sev === "high" || sev === "critical") return "critical";
  return "attention";
}

export function humanizeSignalType(type: string): string {
  return (
    SIGNAL_TYPE_LABEL[type] ??
    type
      .split("_")
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
  );
}
