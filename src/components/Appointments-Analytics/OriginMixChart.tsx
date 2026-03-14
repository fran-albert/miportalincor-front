import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AppointmentsAnalyticsOriginItem } from "@/types/Appointments-Analytics/AppointmentsAnalytics";

const COLORS = ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#DC2626"];

interface Props {
  data?: AppointmentsAnalyticsOriginItem[];
  isLoading: boolean;
}

export function OriginMixChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).map((item) => ({
    name: item.label,
    value: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Origen de turnos</CardTitle>
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
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100} paddingAngle={2}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
