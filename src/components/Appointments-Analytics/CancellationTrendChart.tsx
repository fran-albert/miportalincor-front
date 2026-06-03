import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentsAnalyticsTrendPoint } from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { CHART_AXIS_COLOR, CHART_COLORS, CHART_GRID_COLOR } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data?: AppointmentsAnalyticsTrendPoint[];
  isLoading: boolean;
}

export function CancellationTrendChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).map((item) => ({
    ...item,
    bucketLabel: format(new Date(`${item.bucket}T00:00:00`), "MMM yyyy", {
      locale: es,
    }),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Evolución de cancelaciones</CardTitle>
        <CardDescription>Quién cancela los turnos a lo largo del tiempo.</CardDescription>
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
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_COLOR} />
              <XAxis
                dataKey="bucketLabel"
                tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_COLOR }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="cancelledByPatient"
                stroke={CHART_COLORS.orange}
                strokeWidth={2}
                dot={false}
                name="Paciente"
              />
              <Line
                type="monotone"
                dataKey="cancelledBySecretary"
                stroke={CHART_COLORS.red}
                strokeWidth={2}
                dot={false}
                name="Secretaría"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
