import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AppointmentsAnalyticsOverview,
  OverturnAnalyticsOverview,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { formatNumber } from "./chartTheme";

interface Props {
  overview?: AppointmentsAnalyticsOverview;
  overturnOverview?: OverturnAnalyticsOverview;
  isLoading: boolean;
}

type StepTone = "neutral" | "blue" | "green" | "red";

const TONE_STYLES: Record<StepTone, { value: string; share: string }> = {
  neutral: { value: "text-slate-900", share: "text-slate-500" },
  blue: { value: "text-blue-700", share: "text-blue-600" },
  green: { value: "text-green-700", share: "text-green-600" },
  red: { value: "text-red-700", share: "text-red-600" },
};

function FunnelStep({
  label,
  value,
  share,
  tone,
  isLoading,
}: {
  label: string;
  value: number;
  share?: string;
  tone: StepTone;
  isLoading: boolean;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="min-w-[120px] flex-1 px-2 py-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-1 h-8 w-16" />
      ) : (
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className={cn("text-3xl font-bold leading-none", styles.value)}>
            {formatNumber(value)}
          </span>
          {share && (
            <span className={cn("text-sm font-medium", styles.share)}>{share}</span>
          )}
        </div>
      )}
    </div>
  );
}

function StepArrow() {
  return (
    <ChevronRight className="hidden h-5 w-5 shrink-0 self-center text-muted-foreground/40 md:block" />
  );
}

export function ManagementSummaryCards({
  overview,
  overturnOverview,
  isLoading,
}: Props) {
  const created = overview?.totalCreated ?? 0;
  const scheduled = overview?.totalScheduled ?? 0;
  const completed = overview?.totalCompleted ?? 0;
  const cancelled = overview?.totalCancelled ?? 0;
  const cancellationRate = overview?.cancellationRate ?? 0;
  const overturns = overturnOverview?.totalCreated ?? 0;

  const share = (value: number): string | undefined => {
    if (!created) return undefined;
    return `${Math.round((value / created) * 100)}%`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recorrido de los turnos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col gap-2 rounded-xl border bg-muted/30 p-3 md:flex-row md:items-center md:gap-1">
            <FunnelStep
              label="Creados"
              value={created}
              tone="neutral"
              isLoading={isLoading}
            />
            <StepArrow />
            <FunnelStep
              label="Agendados"
              value={scheduled}
              share={share(scheduled)}
              tone="blue"
              isLoading={isLoading}
            />
            <StepArrow />
            <FunnelStep
              label="Completados"
              value={completed}
              share={share(completed)}
              tone="green"
              isLoading={isLoading}
            />
            <div className="hidden w-px self-stretch bg-border md:block" />
            <FunnelStep
              label="Cancelados"
              value={cancelled}
              share={`${formatNumber(cancellationRate)}%`}
              tone="red"
              isLoading={isLoading}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3 lg:w-48 lg:flex-col lg:items-start lg:justify-center">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-purple-700">
              <Plus className="h-3.5 w-3.5" />
              Sobreturnos
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <span className="text-3xl font-bold leading-none text-purple-700">
                {formatNumber(overturns)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
