import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Upload } from "lucide-react";
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

type BreakdownTone = "green" | "red" | "slate";

const TONE_STYLES: Record<BreakdownTone, { dot: string; value: string }> = {
  green: { dot: "bg-green-500", value: "text-green-700" },
  red: { dot: "bg-red-500", value: "text-red-700" },
  slate: { dot: "bg-slate-400", value: "text-slate-700" },
};

function BreakdownRow({
  label,
  value,
  share,
  tone,
  isLoading,
}: {
  label: string;
  value: number;
  share?: string;
  tone: BreakdownTone;
  isLoading: boolean;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
        {label}
      </span>
      {isLoading ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <span className="flex items-baseline gap-1.5 tabular-nums">
          <span className={cn("text-lg font-semibold", styles.value)}>
            {formatNumber(value)}
          </span>
          {share && (
            <span className="text-xs text-muted-foreground">{share}</span>
          )}
        </span>
      )}
    </div>
  );
}

function ContextStat({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
      <div className="rounded-lg bg-background p-2 text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-14" />
        ) : (
          <p className="text-2xl font-bold leading-none">{formatNumber(value)}</p>
        )}
      </div>
    </div>
  );
}

export function ManagementSummaryCards({
  overview,
  overturnOverview,
  isLoading,
}: Props) {
  const scheduled = overview?.totalScheduled ?? 0;
  const completed = overview?.totalCompleted ?? 0;
  const cancelled = overview?.totalCancelled ?? 0;
  const created = overview?.totalCreated ?? 0;
  const overturns = overturnOverview?.totalCreated ?? 0;
  const pending = Math.max(0, scheduled - completed - cancelled);

  const share = (value: number): string | undefined => {
    if (!scheduled) return undefined;
    return `${Math.round((value / scheduled) * 100)}%`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Turnos del período</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-[auto,1fr] md:items-center md:gap-6">
          <div className="md:border-r md:pr-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Agendados en el período
            </p>
            {isLoading ? (
              <Skeleton className="mt-1 h-10 w-24" />
            ) : (
              <p className="mt-0.5 text-4xl font-bold leading-none">
                {formatNumber(scheduled)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Turnos cuya fecha cae en el período
            </p>
          </div>

          <div className="divide-y">
            <BreakdownRow
              label="Completados"
              value={completed}
              share={share(completed)}
              tone="green"
              isLoading={isLoading}
            />
            <BreakdownRow
              label="Cancelados"
              value={cancelled}
              share={share(cancelled)}
              tone="red"
              isLoading={isLoading}
            />
            <BreakdownRow
              label="Pendientes"
              value={pending}
              share={share(pending)}
              tone="slate"
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ContextStat
            icon={<Upload className="h-4 w-4" />}
            label="Cargados en el período"
            value={created}
            isLoading={isLoading}
          />
          <ContextStat
            icon={<Plus className="h-4 w-4" />}
            label="Sobreturnos"
            value={overturns}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
