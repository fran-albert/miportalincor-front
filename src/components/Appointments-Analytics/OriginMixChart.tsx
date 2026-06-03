import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppointmentsAnalyticsOriginItem } from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { CHART_PALETTE, formatNumber } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data?: AppointmentsAnalyticsOriginItem[];
  isLoading: boolean;
}

export function OriginMixChart({ data, isLoading }: Props) {
  const chartData = (data ?? []).map((item, index) => ({
    name: item.label,
    value: item.total,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Origen de turnos</CardTitle>
        <CardDescription>Por dónde se generan los turnos del período.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !chartData.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin datos para el período seleccionado.
          </div>
        ) : (
          <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
            <div className="h-[200px] w-full sm:h-full sm:flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={96}
                    paddingAngle={2}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="w-full space-y-2 sm:w-44">
              {chartData.map((entry) => {
                const percent = total
                  ? Math.round((entry.value / total) * 100)
                  : 0;
                return (
                  <li
                    key={entry.name}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate text-muted-foreground">
                        {entry.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatNumber(entry.value)} · {percent}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
