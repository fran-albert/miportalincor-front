import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MeasurementMetric,
  MeasurementResponse,
} from "@/types/Program/ProgramClinicalIntake";

interface PainScoreChartProps {
  entries: MeasurementResponse[];
  metric: MeasurementMetric;
  height?: number;
}

const toDisplayDate = (isoDate: string) =>
  isoDate.split("-").reverse().join("/");

/**
 * La curva que pidió el Dr. Bruera. Mismo patrón que `NutritionChart`
 * (recharts, ya instalado): no se sumó ninguna librería de gráficos.
 * La escala se fija en el mínimo y máximo que declara la métrica —no en los
 * datos— porque un 8 y un 7 con eje autoescalado parecen una mejora enorme.
 */
export default function PainScoreChart({
  entries,
  metric,
  height = 260,
}: PainScoreChartProps) {
  const chartData = entries.map((entry) => ({
    date: toDisplayDate(entry.measuredAt),
    value: entry.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 16, right: 16, left: 0, bottom: 24 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          height={50}
          angle={-35}
          textAnchor="end"
          tick={{ fontSize: 12, fill: "#333" }}
        />
        <YAxis
          domain={[metric.min, metric.max]}
          ticks={Array.from(
            { length: metric.max - metric.min + 1 },
            (_, index) => metric.min + index
          )}
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#333" }}
          label={{
            value: metric.label,
            angle: -90,
            position: "insideLeft",
            offset: 10,
          }}
        />
        <Tooltip
          formatter={(value: number) => [`${value} / ${metric.max}`, metric.label]}
          labelFormatter={(label: string) => `Fecha: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="value"
          name={metric.label}
          stroke="#0d9488"
          strokeWidth={3}
          dot={{ r: 5, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
