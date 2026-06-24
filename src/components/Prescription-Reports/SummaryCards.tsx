import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle, Ban } from "lucide-react";
import type { PrescriptionReportSummary } from "@/types/Prescription-Reports/Prescription-Reports";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  data: PrescriptionReportSummary | undefined;
  isLoading: boolean;
}

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function KpiCard({ title, value, icon, color, isLoading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const formatHours = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)} hs`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}hs`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        title="Total Solicitudes"
        value={data?.totalRequests ?? 0}
        icon={<FileText className="h-5 w-5" />}
        color="text-blue-600"
        isLoading={isLoading}
      />
      <KpiCard
        title="Completadas"
        value={data?.completedRequests ?? 0}
        icon={<CheckCircle className="h-5 w-5" />}
        color="text-green-600"
        isLoading={isLoading}
      />
      <KpiCard
        title="Pendientes"
        value={data?.pendingRequests ?? 0}
        icon={<Clock className="h-5 w-5" />}
        color="text-amber-600"
        isLoading={isLoading}
      />
      <KpiCard
        title="Rechazadas"
        value={data?.rejectedRequests ?? 0}
        icon={<XCircle className="h-5 w-5" />}
        color="text-red-600"
        isLoading={isLoading}
      />
      <KpiCard
        title="Tiempo Promedio"
        value={data ? formatHours(data.avgProcessingTimeHours) : "—"}
        icon={<Ban className="h-5 w-5" />}
        color="text-purple-600"
        isLoading={isLoading}
      />
    </div>
  );
}
