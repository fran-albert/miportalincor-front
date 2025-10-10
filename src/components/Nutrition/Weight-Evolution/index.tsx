// WeightEvolutionCard.tsx
import { useMemo, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { Label } from "@/components/ui/label";
import { NutritionChart } from "../Chart";
import { Badge } from "@/components/ui/badge";
import CustomDatePicker from "@/components/Date-Picker";
interface Props {
  nutritionData: NutritionData[];
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: React.Dispatch<React.SetStateAction<Date | undefined>>;
  onEndDateChange: React.Dispatch<React.SetStateAction<Date | undefined>>;
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
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Hero Background con Gradiente */}
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 px-8 py-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-white" />
                <h2 className="text-white text-2xl font-bold">
                  Evolución de Peso
                </h2>
                <Badge className="bg-white/20 text-white border-white/30">
                  {filteredData.length} registros
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-48">
                  <Label
                    htmlFor="startDate"
                    className="text-white text-sm mb-2 block"
                  >
                    Desde
                  </Label>
                  <CustomDatePicker
                    setStartDate={onStartDateChange}
                    setValue={() => {}}
                    fieldName="startDate"
                    initialDate={startDate}
                    whiteBg={true}
                  />
                </div>
                <div className="flex-1 sm:w-48">
                  <Label
                    htmlFor="endDate"
                    className="text-white text-sm mb-2 block"
                  >
                    Hasta
                  </Label>
                  <CustomDatePicker
                    setStartDate={onEndDateChange}
                    setValue={() => {}}
                    fieldName="endDate"
                    initialDate={endDate}
                    whiteBg={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
