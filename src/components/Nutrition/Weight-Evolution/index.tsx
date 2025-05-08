import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardPlus } from "lucide-react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { NutritionChart } from "../Chart";
import { useState, useMemo } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface Props {
  nutritionData: NutritionData[];
}

const WeightEvolutionCard: React.FC<Props> = ({ nutritionData: initialData }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
            <Label htmlFor="startDate" className="block mb-1 text-sm font-medium">
              Desde
            </Label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate" className="block mb-1 text-sm font-medium">
              Hasta
            </Label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="mx-auto w-full max-w-2xl">
            <NutritionChart data={filteredData} />
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
