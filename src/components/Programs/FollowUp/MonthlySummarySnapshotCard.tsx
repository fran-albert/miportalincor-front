import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProgramMonthlySummaryMetricsSnapshot } from "@/types/Program/ProgramFollowUp";

interface MonthlySummarySnapshotCardProps {
  snapshot?: ProgramMonthlySummaryMetricsSnapshot;
  title?: string;
  emptyMessage?: string;
  variant?: "staff" | "patient";
}

const getComplianceTone = (compliance: number) => {
  if (compliance >= 80) {
    return {
      badge: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      bar: "bg-emerald-500",
      card: "from-emerald-50 to-white",
      label: "Muy buen cumplimiento",
    };
  }

  if (compliance >= 50) {
    return {
      badge: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      bar: "bg-amber-500",
      card: "from-amber-50 to-white",
      label: "Cumplimiento intermedio",
    };
  }

  return {
    badge: "bg-rose-100 text-rose-700 hover:bg-rose-100",
    bar: "bg-rose-500",
    card: "from-rose-50 to-white",
    label: "Cumplimiento bajo",
  };
};

const formatWeight = (value?: number) =>
  value === undefined ? "-" : `${value.toFixed(1)} kg`;

export function MonthlySummarySnapshotCard({
  snapshot,
  title = "Datos del mes",
  emptyMessage = "No hay métricas automáticas disponibles para este período.",
  variant = "staff",
}: MonthlySummarySnapshotCardProps) {
  if (!snapshot) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="py-10 text-center">
          <div className="mx-auto max-w-lg space-y-2">
            <p className="text-lg font-semibold text-slate-900">
              Todavía no hay datos del período.
            </p>
            <p className="text-sm leading-6 text-slate-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const complianceTone = getComplianceTone(snapshot.globalCompliance);
  const totalActivities = snapshot.activities.length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
            <p className="text-sm leading-6 text-slate-500">
              {variant === "patient"
                ? "Este bloque resume de forma simple cómo fue tu actividad en el período."
                : "Estos números se actualizan automáticamente con el plan y las asistencias registradas."}
            </p>
          </div>
          <Badge variant="outline" className={cn("border-0", complianceTone.badge)}>
            {complianceTone.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div
            className={cn(
              "rounded-2xl border border-slate-200 bg-gradient-to-br p-5",
              complianceTone.card
            )}
          >
            <div className="text-sm font-medium text-slate-500">
              Cumplimiento global
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
              {snapshot.globalCompliance.toFixed(1)}%
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Valor calculado con todo lo esperado y lo realizado durante el mes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-500">
              Actividades planificadas
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
              {snapshot.totalExpected}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cantidad de actividades esperadas en el período.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-500">
              Actividades realizadas
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
              {snapshot.totalAttended}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Registros cargados sobre {totalActivities} actividad
              {totalActivities === 1 ? "" : "es"} del plan.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Detalle por actividad
            </h3>
            <p className="text-sm leading-6 text-slate-500">
              Cada barra muestra cuánto se completó respecto de lo planificado.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {snapshot.activities.map((activity) => {
              const activityTone = getComplianceTone(activity.compliance);

              return (
                <div
                  key={activity.activityId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">
                        {activity.activityName}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {activity.attended} realizadas de {activity.expected} planificadas
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("w-fit border-0", activityTone.badge)}
                    >
                      {activity.compliance.toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="mt-4 h-3 w-full rounded-full bg-slate-200">
                    <div
                      className={cn("h-3 rounded-full transition-all", activityTone.bar)}
                      style={{
                        width: `${Math.min(activity.compliance, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {snapshot.nutrition && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Evolución de peso
              </h3>
              <p className="text-sm leading-6 text-slate-500">
                Datos tomados de los registros de nutrición del período.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-500">Peso inicial</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {formatWeight(snapshot.nutrition.firstWeight)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-500">Peso final</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {formatWeight(snapshot.nutrition.lastWeight)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-500">Cambio del mes</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {formatWeight(snapshot.nutrition.deltaWeight)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
