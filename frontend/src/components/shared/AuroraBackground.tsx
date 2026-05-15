import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  intensity?: "subtle" | "hero";
  className?: string;
  withGrid?: boolean;
}

export function AuroraBackground({
  intensity = "hero",
  className,
  withGrid = true,
}: AuroraBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="aurora-bg" data-intensity={intensity} />
      {withGrid ? <div className="absolute inset-0 bg-grid-faint opacity-40" /> : null}
    </div>
  );
}
