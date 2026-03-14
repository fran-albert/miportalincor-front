import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CartesianGrid,
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

interface Props {
  data?: AppointmentsAnalyticsTrendPoint[];
  isLoading: boolean;
}

export function CancellationTrendChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).map((item) => ({
    ...item,
    bucketLabel: format(new Date(`${item.bucket}T00:00:00`), "MMM yyyy", { locale: es }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de cancelaciones</CardTitle>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucketLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="cancelledByPatient" stroke="#EA580C" strokeWidth={2} name="Paciente" />
              <Line type="monotone" dataKey="cancelledBySecretary" stroke="#DC2626" strokeWidth={2} name="Secretaría" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
