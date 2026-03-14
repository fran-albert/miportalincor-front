import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AppointmentOrigin, AppointmentOriginLabels } from "@/types/Appointment/Appointment";

const ORIGINS = [
  AppointmentOrigin.SECRETARY,
  AppointmentOrigin.WEB_PATIENT,
  AppointmentOrigin.WEB_GUEST,
  AppointmentOrigin.DOCTOR,
];

const ORIGIN_COLORS: Record<AppointmentOrigin, string> = {
  [AppointmentOrigin.SECRETARY]: "#2563EB",
  [AppointmentOrigin.WEB_PATIENT]: "#16A34A",
  [AppointmentOrigin.WEB_GUEST]: "#EA580C",
  [AppointmentOrigin.DOCTOR]: "#7C3AED",
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
      <CardHeader>
        <CardTitle>Origen por médico</CardTitle>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={86} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {ORIGINS.map((origin) => (
                <Bar
                  key={origin}
                  dataKey={origin}
                  stackId="origin"
                  fill={ORIGIN_COLORS[origin]}
                  name={AppointmentOriginLabels[origin]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
