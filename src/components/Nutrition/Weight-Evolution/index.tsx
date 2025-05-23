// WeightEvolutionCard.tsx
import { useMemo, forwardRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardPlus } from "lucide-react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { Label } from "@/components/ui/label";
import { NutritionChart } from "../Chart";

interface Props {
  nutritionData: NutritionData[];
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (d?: Date) => void;
  onEndDateChange: (d?: Date) => void;
}

const CAPTURE_WIDTH = 600;
const CAPTURE_HEIGHT = 300;

const WeightEvolutionCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      nutritionData: initialData,
      startDate,
      endDate,
      onStartDateChange,
      onEndDateChange,
    },
    chartRef
  ) => {
    const filteredData = useMemo(() => {
      return initialData.filter((d) => {
        const date = typeof d.date === "string" ? new Date(d.date) : d.date;
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
    }, [initialData, startDate, endDate]);

    return (
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <ClipboardPlus className="mr-2 text-greenPrimary" />
            <CardTitle className="text-greenPrimary">Evolución Peso</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex-1">
              <Label htmlFor="startDate">Desde</Label>
              <input
                id="startDate"
                type="date"
                className="w-full rounded border p-2 text-sm"
                value={startDate?.toISOString().slice(0, 10) ?? ""}
                onChange={(e) =>
                  onStartDateChange(
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Hasta</Label>
              <input
                id="endDate"
                type="date"
                className="w-full rounded border p-2 text-sm"
                value={endDate?.toISOString().slice(0, 10) ?? ""}
                onChange={(e) =>
                  onEndDateChange(
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="mx-auto w-full max-w-2xl">
              <div
                ref={chartRef}
                style={{ width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT }}
              >
                <NutritionChart
                  data={filteredData}
                  width={CAPTURE_WIDTH}
                  height={CAPTURE_HEIGHT}
                />
              </div>
            </div>
          ) : (
            <p className="text-center py-8">
              No hay datos en este rango de fechas
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default WeightEvolutionCard;
