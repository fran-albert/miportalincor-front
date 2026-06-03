import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, UserPlus, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/components/Appointments-Analytics/chartTheme";

interface UnregisteredResolutionFunnelProps {
  detected: number;
  resolved: number;
  createdNew: number;
  linkedExisting: number;
  pending: number;
  resolutionRate: number;
  isLoading: boolean;
}

function Step({
  label,
  value,
  share,
  tone,
  isLoading,
}: {
  label: string;
  value: number;
  share?: string;
  tone: "neutral" | "green" | "amber";
  isLoading: boolean;
}) {
  const valueColor = {
    neutral: "text-slate-900",
    green: "text-green-700",
    amber: "text-amber-700",
  }[tone];

  return (
    <div className="min-w-[120px] flex-1 px-2 py-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-1 h-8 w-16" />
      ) : (
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className={cn("text-3xl font-bold leading-none", valueColor)}>
            {formatNumber(value)}
          </span>
          {share && (
            <span className="text-sm font-medium text-muted-foreground">
              {share}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function UnregisteredResolutionFunnel({
  detected,
  resolved,
  createdNew,
  linkedExisting,
  pending,
  resolutionRate,
  isLoading,
}: UnregisteredResolutionFunnelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Resolución de DNI no encontrado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 md:flex-row md:items-center md:gap-1">
          <Step
            label="Detectados"
            value={detected}
            tone="neutral"
            isLoading={isLoading}
          />
          <ChevronRight className="hidden h-5 w-5 shrink-0 self-center text-muted-foreground/40 md:block" />
          <Step
            label="Resueltos"
            value={resolved}
            share={`${formatNumber(resolutionRate)}%`}
            tone="green"
            isLoading={isLoading}
          />
          <ChevronRight className="hidden h-5 w-5 shrink-0 self-center text-muted-foreground/40 md:block" />
          <Step
            label="Pendientes"
            value={pending}
            tone="amber"
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3">
            <div className="rounded-lg bg-green-100 p-2 text-green-700">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Nuevos pacientes
              </p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-xl font-bold text-green-700">
                  {formatNumber(createdNew)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Vinculados a paciente existente
              </p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-xl font-bold text-blue-700">
                  {formatNumber(linkedExisting)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
