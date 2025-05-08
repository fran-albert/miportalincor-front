import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { formatDate } from "@/common/helpers/helpers";

interface Props {
  data: NutritionData[];
}

export const NutritionChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((d) => ({
    date:
      typeof d.date === "string"
        ? formatDate(d.date)
        : new Date(d.date).toISOString().slice(0, 10),
    weight: d.weight,
    targetWeight: d.targetWeight,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" height={60} angle={-45} textAnchor="end" />

        <YAxis
          label={{
            value: "Peso (kg)",
            angle: -90,
            position: "insideLeft",
            offset: 10,
          }}
          domain={["dataMin - 2", "dataMax + 2"]}
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
          dot={false}
          strokeDasharray="6 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
