import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppointmentsAnalyticsGroupedItem } from "@/types/Appointments-Analytics/AppointmentsAnalytics";

interface Props {
  data?: AppointmentsAnalyticsGroupedItem[];
  isLoading: boolean;
}

export function ConsultationTypeVolumeChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).slice(0, 8).map((item) => ({
    name: item.label,
    total: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mix por tipo de turno</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !chartData.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin datos para el período seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={72} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
