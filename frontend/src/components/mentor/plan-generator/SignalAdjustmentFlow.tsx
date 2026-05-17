"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Wand2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdjustPeriodPickerStep } from "@/components/mentor/plan-generator/AdjustPeriodPickerStep";
import { PeriodAdjustmentSheet } from "@/components/mentor/plan-generator/PeriodAdjustmentSheet";
import { getNewcomerJourney } from "@/services/journey";
import { listSignalsForNewcomer } from "@/services/signals";
import type { AISignal, ID, JourneyPeriod } from "@/types";

interface SignalAdjustmentFlowProps {
  open: boolean;
  onClose: () => void;
  signal: AISignal | null;
  newcomerId: ID | null;
  newcomerName?: string;
}

export function SignalAdjustmentFlow(props: SignalAdjustmentFlowProps) {
  if (!props.open) return null;
  return <SignalAdjustmentFlowInner {...props} />;
}

type Step = "picker" | "review";

function SignalAdjustmentFlowInner({
  open,
  onClose,
  signal,
  newcomerId,
  newcomerName,
}: SignalAdjustmentFlowProps) {
  const [step, setStep] = React.useState<Step>("picker");
  const [manualSelection, setManualSelection] = React.useState<JourneyPeriod | null>(null);

  const journeyQ = useQuery({
    queryKey: ["journey", newcomerId, "adjust-picker"],
    queryFn: () => getNewcomerJourney(newcomerId!),
    enabled: newcomerId != null,
  });

  const signalsQ = useQuery({
    queryKey: ["signals", newcomerId, "open"],
    queryFn: () => listSignalsForNewcomer(newcomerId!, "open"),
    enabled: newcomerId != null,
  });

  const periods = React.useMemo<JourneyPeriod[]>(
    () => journeyQ.data?.periods ?? [],
    [journeyQ.data?.periods],
  );

  const recommendedPeriod = React.useMemo(
    () => recommendPeriod(periods),
    [periods],
  );

  // Derived selected period — user choice wins, otherwise fall back to recommendation.
  const selectedPeriod = manualSelection ?? recommendedPeriod;

  const signalCountByPlanId = React.useMemo<Record<number, number>>(() => {
    const counts: Record<number, number> = {};
    const data = signalsQ.data;
    if (!data) return counts;
    // Without a plan_id on AISignal, attribute open signals to the most active period so the
    // mentor sees pressure on a concrete card. Keeps the picker honest without an extra fetch.
    const active = periods.find((p) => p.status !== "archived" && p.tasks_done < p.tasks_total);
    if (active) counts[Number(active.plan_id)] = data.length;
    return counts;
  }, [signalsQ.data, periods]);

  const nextPeriod = React.useMemo(() => {
    if (!selectedPeriod) return null;
    return periods.find((p) => p.start_day > selectedPeriod.start_day) ?? null;
  }, [periods, selectedPeriod]);

  if (step === "review" && selectedPeriod) {
    return (
      <PeriodAdjustmentSheet
        open
        onClose={onClose}
        newcomerId={newcomerId}
        newcomerName={newcomerName}
        period={selectedPeriod}
        seedSignalId={signal?.id ?? null}
        seedSignalContext={signal}
        nextPeriodPlanId={nextPeriod?.plan_id ?? null}
        nextPeriodLabel={nextPeriod?.label ?? null}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg ai-gradient text-white shadow-[var(--shadow-ai)]">
              <Wand2 className="h-3.5 w-3.5" />
            </span>
            Propose targeted changes
          </DialogTitle>
          <DialogDescription>
            Pick which onboarding period the AI should adjust based on this signal.
            {newcomerName ? (
              <>
                {" "}
                Target: <span className="font-medium">{newcomerName}</span>.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <AdjustPeriodPickerStep
          periods={periods}
          isLoading={journeyQ.isLoading}
          signal={signal}
          selectedPeriodId={selectedPeriod?.id ?? null}
          onSelect={setManualSelection}
          onConfirm={() => setStep("review")}
          onCancel={onClose}
          signalCountByPlanId={signalCountByPlanId}
        />
      </DialogContent>
    </Dialog>
  );
}

function recommendPeriod(periods: JourneyPeriod[]): JourneyPeriod | null {
  return (
    periods.find((p) => p.status !== "archived" && p.tasks_done < p.tasks_total) ??
    periods[0] ??
    null
  );
}
