import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/components/Appointments-Analytics/chartTheme";

interface TotemActivitySummaryProps {
  totalTickets: number;
  scheduled: number;
  invited: number;
  administrative: number;
  unregistered: number;
  isLoading: boolean;
}

function Stat({
  label,
  value,
  isLoading,
  emphasis = false,
}: {
  label: string;
  value: number;
  isLoading: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-[110px] flex-1 px-3 py-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-1 h-8 w-16" />
      ) : (
        <p
          className={cn(
            "mt-0.5 font-bold leading-none",
            emphasis ? "text-3xl text-slate-900" : "text-2xl text-slate-700"
          )}
        >
          {formatNumber(value)}
        </p>
      )}
    </div>
  );
}

export function TotemActivitySummary({
  totalTickets,
  scheduled,
  invited,
  administrative,
  unregistered,
  isLoading,
}: TotemActivitySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actividad del tótem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y rounded-xl border bg-muted/30 md:flex-row md:divide-x md:divide-y-0">
          <Stat
            label="Tickets"
            value={totalTickets}
            isLoading={isLoading}
            emphasis
          />
          <Stat label="Con turno" value={scheduled} isLoading={isLoading} />
          <Stat label="Invitados" value={invited} isLoading={isLoading} />
          <Stat
            label="Administrativo"
            value={administrative}
            isLoading={isLoading}
          />
          <Stat
            label="DNI no encontrado"
            value={unregistered}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
