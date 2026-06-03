import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppointmentsAnalyticsDoctorItem } from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import {
  AppointmentOrigin,
  AppointmentOriginLabels,
} from "@/types/Appointment/Appointment";
import { CHART_AXIS_COLOR, CHART_COLORS, CHART_GRID_COLOR } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

const ORIGINS = [
  AppointmentOrigin.SECRETARY,
  AppointmentOrigin.WEB_PATIENT,
  AppointmentOrigin.WEB_GUEST,
  AppointmentOrigin.DOCTOR,
];

const ORIGIN_COLORS: Record<AppointmentOrigin, string> = {
  [AppointmentOrigin.SECRETARY]: CHART_COLORS.blue,
  [AppointmentOrigin.WEB_PATIENT]: CHART_COLORS.green,
  [AppointmentOrigin.WEB_GUEST]: CHART_COLORS.orange,
  [AppointmentOrigin.DOCTOR]: CHART_COLORS.purple,
};

interface Props {
  data?: AppointmentsAnalyticsDoctorItem[];
  isLoading: boolean;
}

export function DoctorOriginChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).slice(0, 8).map((item) => {
    const breakdown = Object.fromEntries(
      ORIGINS.map((origin) => [
        origin,
        item.originBreakdown.find((entry) => entry.origin === origin)?.total ?? 0,
      ])
    );

    return {
      name: item.label,
      ...breakdown,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Origen por médico</CardTitle>
        <CardDescription>Cómo se reparten los turnos de cada médico según su origen.</CardDescription>
      </CardHeader>
      <CardContent className="h-[360px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !chartData.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin datos para el período seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_COLOR} />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={86}
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
              <Tooltip cursor={{ fill: "rgba(100, 116, 139, 0.06)" }} content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {ORIGINS.map((origin) => (
                <Bar
                  key={origin}
                  dataKey={origin}
                  stackId="origin"
                  fill={ORIGIN_COLORS[origin]}
                  name={AppointmentOriginLabels[origin]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
