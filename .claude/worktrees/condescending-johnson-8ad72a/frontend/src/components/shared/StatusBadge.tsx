import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE, SEVERITY_TONE, PRIORITY_TONE } from "@/lib/constants";
import type { StatusTone } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  override?: StatusTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, override, size = "md", className }: StatusBadgeProps) {
  const key = (status ?? "").toLowerCase().replace(/\s+/g, "_");
  const tone: StatusTone = override ?? STATUS_TONE[key] ?? "neutral";
  const label = STATUS_LABEL[key] ?? humanize(status);
  return (
    <Badge tone={tone} size={size} className={className}>
      <Dot tone={tone} />
      {label}
    </Badge>
  );
}

export function SeverityBadge({ severity, size = "md", className }: { severity: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const tone: StatusTone = SEVERITY_TONE[severity?.toLowerCase()] ?? "neutral";
  return (
    <Badge tone={tone} size={size} className={className}>
      {humanize(severity)}
    </Badge>
  );
}

export function PriorityBadge({ priority, size = "md", className }: { priority: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const tone: StatusTone = PRIORITY_TONE[priority?.toLowerCase()] ?? "neutral";
  return (
    <Badge tone={tone} size={size} className={className}>
      {humanize(priority)}
    </Badge>
  );
}

function Dot({ tone }: { tone: StatusTone }) {
  const colorMap: Record<StatusTone, string> = {
    neutral: "bg-stone-400",
    success: "bg-[color:var(--color-success)]",
    warning: "bg-[color:var(--color-warning)]",
    danger: "bg-[color:var(--color-danger)]",
    info: "bg-[color:var(--color-info)]",
    ai: "ai-gradient",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${colorMap[tone]}`} />;
}

function humanize(value: string): string {
  if (!value) return "—";
  return value
    .split(/[_\s]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
