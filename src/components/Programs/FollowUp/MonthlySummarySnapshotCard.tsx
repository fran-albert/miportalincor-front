import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramMonthlySummaryMetricsSnapshot } from "@/types/Program/ProgramFollowUp";

interface MonthlySummarySnapshotCardProps {
  snapshot?: ProgramMonthlySummaryMetricsSnapshot;
  title?: string;
  emptyMessage?: string;
}

const progressColor = (compliance: number) => {
  if (compliance >= 80) {
    return "#16a34a";
  }
  if (compliance >= 50) {
    return "#ca8a04";
  }
  return "#dc2626";
};

const formatWeight = (value?: number) =>
  value === undefined ? "-" : `${value.toFixed(1)} kg`;

export function MonthlySummarySnapshotCard({
  snapshot,
  title = "Métricas del mes",
  emptyMessage = "No hay métricas automáticas disponibles para este período.",
}: MonthlySummarySnapshotCardProps) {
  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Cumplimiento global</div>
            <div className="mt-1 text-2xl font-semibold text-greenPrimary">
              {snapshot.globalCompliance.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Esperado / realizado</div>
            <div className="mt-1 text-2xl font-semibold">
              {snapshot.totalAttended}/{snapshot.totalExpected}
            </div>
          </div>
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Registros</div>
            <div className="mt-1 text-2xl font-semibold">
              {snapshot.totalRecords}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {snapshot.activities.map((activity) => (
            <div key={activity.activityId} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="font-medium">{activity.activityName}</span>
                <span className="text-sm text-gray-500">
                  {activity.attended}/{activity.expected}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(activity.compliance, 100)}%`,
                        backgroundColor: progressColor(activity.compliance),
                      }}
                    />
                  </div>
                </div>
                <span className="w-14 text-right text-sm font-semibold">
                  {activity.compliance.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {snapshot.nutrition && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="text-sm text-gray-500">Peso inicial</div>
              <div className="mt-1 text-xl font-semibold">
                {formatWeight(snapshot.nutrition.firstWeight)}
              </div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="text-sm text-gray-500">Peso final</div>
              <div className="mt-1 text-xl font-semibold">
                {formatWeight(snapshot.nutrition.lastWeight)}
              </div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="text-sm text-gray-500">Delta</div>
              <div className="mt-1 text-xl font-semibold">
                {formatWeight(snapshot.nutrition.deltaWeight)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
