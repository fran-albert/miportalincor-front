import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";
import {
  AppointmentsAnalyticsOverview,
  OverturnAnalyticsOverview,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";

interface Props {
  overview?: AppointmentsAnalyticsOverview;
  overturnOverview?: OverturnAnalyticsOverview;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );
}

export function ManagementSummaryCards({ overview, overturnOverview, isLoading }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Turnos creados" value={overview?.totalCreated ?? 0} icon={<Clock3 className="h-5 w-5 text-slate-500" />} isLoading={isLoading} />
      <StatCard title="Turnos agendados" value={overview?.totalScheduled ?? 0} icon={<CalendarDays className="h-5 w-5 text-blue-600" />} isLoading={isLoading} />
      <StatCard title="Completados" value={overview?.totalCompleted ?? 0} icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} isLoading={isLoading} />
      <StatCard title="Cancelados" value={overview?.totalCancelled ?? 0} icon={<XCircle className="h-5 w-5 text-red-600" />} isLoading={isLoading} />
      <StatCard title="Tasa cancelación" value={`${overview?.cancellationRate ?? 0}%`} icon={<RotateCcw className="h-5 w-5 text-amber-600" />} isLoading={isLoading} />
      <StatCard title="Sobreturnos" value={overturnOverview?.totalCreated ?? 0} icon={<CalendarDays className="h-5 w-5 text-purple-600" />} isLoading={isLoading} />
    </div>
  );
}
