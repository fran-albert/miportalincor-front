// NutritionChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { formatDateOnly } from "@/common/helpers/helpers";
import { format } from "date-fns";

interface Props {
  data: NutritionData[];
  width?: number | string;
  height?: number | string;
}

export const NutritionChart: React.FC<Props> = ({ data, width = "100%", height = 300 }) => {
  const chartData = data.map((d) => ({
    date: formatDateOnly(
      typeof d.date === "string"
        ? d.date.split("T")[0]
        : format(d.date, "yyyy-MM-dd")
    ),
    weight: d.weight,
    targetWeight: d.targetWeight,
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 40, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />

        {/* Leyenda para identificar líneas */}
        <Legend verticalAlign="top" height={30} />

        <XAxis
          dataKey="date"
          height={60}
          angle={-45}
          textAnchor="end"
          axisLine={{ stroke: '#8884d8', strokeWidth: 1 }}
          tickLine={{ stroke: '#8884d8', strokeWidth: 1 }}
          tick={{ fontSize: 12, fill: '#333' }}
        />

        <YAxis
          label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', offset: 10 }}
          domain={["dataMin - 2", "dataMax + 2"]}
          axisLine={{ stroke: '#82ca9d', strokeWidth: 1 }}
          tickLine={{ stroke: '#82ca9d', strokeWidth: 1 }}
          tick={{ fontSize: 12, fill: '#333' }}
          tickFormatter={(value) => Number(value).toFixed(1)}
        />

        <Tooltip
          formatter={(value: number) => `${value.toFixed(1)} kg`}
          labelFormatter={(label: string) => `Fecha: ${label}`}
        />

        <Line
          type="monotone"
          dataKey="weight"
          name="Peso (kg)"
          stroke="#8884d8"
          strokeWidth={4}
          dot={{ r: 5, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
          strokeLinecap="round"
        />

        <Line
          type="monotone"
          dataKey="targetWeight"
          name="Peso objetivo"
          stroke="#82ca9d"
          strokeWidth={3}
          dot={{ r: 5, strokeWidth: 2 }}
          strokeDasharray="6 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
