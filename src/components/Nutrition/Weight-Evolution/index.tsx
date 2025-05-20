// WeightEvolutionCard.tsx
import React, { useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardPlus } from "lucide-react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { Label } from "@/components/ui/label";
import { toPng } from "html-to-image";
import { NutritionChart } from "../Chart";

interface Props {
  nutritionData: NutritionData[];
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (d?: Date) => void;
  onEndDateChange: (d?: Date) => void;
  onChartReady: (dataUrl: string) => void;
}

const CAPTURE_WIDTH = 600;
const CAPTURE_HEIGHT = 300;

const WeightEvolutionCard: React.FC<Props> = ({
  nutritionData: initialData,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onChartReady,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    return initialData.filter((d) => {
      const date = typeof d.date === "string" ? new Date(d.date) : d.date;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }, [initialData, startDate, endDate]);

  useEffect(() => {
    if (chartRef.current) {
      Object.assign(chartRef.current.style, {
        width: `${CAPTURE_WIDTH}px`,
        height: `${CAPTURE_HEIGHT}px`,
      });
      toPng(chartRef.current, { cacheBust: true, pixelRatio: 2 })
        .then(onChartReady)
        .catch(console.error)
        .finally(() => {
          chartRef.current!.style.width = "";
          chartRef.current!.style.height = "";
        });
    }
  }, [filteredData, onChartReady]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center">
          <ClipboardPlus className="mr-2 text-greenPrimary" />
          <CardTitle className="text-greenPrimary">Evolución Peso</CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex-1">
            <Label
              htmlFor="startDate"
              className="block mb-1 text-sm font-medium"
            >
              Desde
            </Label>
            <input
              id="startDate"
              type="date"
              className="w-full rounded border border-gray-300 p-2 text-sm"
              value={startDate ? startDate.toISOString().slice(0, 10) : ""}
              onChange={(e) => {
                const d = e.target.value ? new Date(e.target.value) : undefined;
                onStartDateChange(d);
              }}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate" className="block mb-1 text-sm font-medium">
              Hasta
            </Label>
            <input
              id="endDate"
              type="date"
              className="w-full rounded border border-gray-300 p-2 text-sm"
              value={endDate ? endDate.toISOString().slice(0, 10) : ""}
              onChange={(e) => {
                const d = e.target.value ? new Date(e.target.value) : undefined;
                onEndDateChange(d);
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="mx-auto w-full max-w-2xl">
            <div ref={chartRef}>
              <NutritionChart
                data={filteredData}
                width={CAPTURE_WIDTH}
                height={CAPTURE_HEIGHT}
              />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No hay datos en este rango de fechas
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightEvolutionCard;
