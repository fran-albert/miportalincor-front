import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrescriptionReportByDoctor } from "@/types/Prescription-Reports/Prescription-Reports";
import { useMemo } from "react";

interface DoctorVolumeChartProps {
  data: PrescriptionReportByDoctor[] | undefined;
  isLoading: boolean;
}

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

export function DoctorVolumeChart({ data, isLoading }: DoctorVolumeChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10)
      .map((doctor) => ({
        name: doctor.doctorName.length > 20
          ? doctor.doctorName.substring(0, 18) + "..."
          : doctor.doctorName,
        fullName: doctor.doctorName,
        completadas: doctor.completed,
        pendientes: doctor.pending,
        rechazadas: doctor.rejected,
      }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-greenPrimary">
          Top 10 Médicos por Volumen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : !chartData.length ? (
          <p className="text-center text-gray-500 py-10">
            No hay datos disponibles para el período seleccionado.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#333" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 11, fill: "#333" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(label: string) => {
                  const item = chartData.find((d) => d.name === label);
                  return item?.fullName ?? label;
                }}
              />
              <Bar
                dataKey="completadas"
                name="Completadas"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
