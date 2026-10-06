import { useMemo, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler } from "lucide-react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { NutritionChart } from "../Chart";
import { Badge } from "@/components/ui/badge";
import { formatDateOnly } from "@/common/helpers/helpers";
import { cn } from "@/lib/utils";
import {
  computeWaistChange,
  formatSignedCm,
  recordsWithWaist,
} from "./waistChange";

interface Props {
  nutritionData: NutritionData[];
  startDate?: Date;
  endDate?: Date;
}

const CAPTURE_WIDTH = 600;
const CAPTURE_HEIGHT = 300;

const WaistEvolutionCard = forwardRef<HTMLDivElement, Props>(
  ({ nutritionData, startDate, endDate }, chartRef) => {
    const filteredData = useMemo(
      () =>
        recordsWithWaist(nutritionData).filter((d) => {
          const date =
            typeof d.date === "string"
              ? new Date(d.date.split("T")[0] + "T00:00:00")
              : d.date;
          if (startDate && date < startDate) return false;
          if (endDate && date > endDate) return false;
          return true;
        }),
      [nutritionData, startDate, endDate]
    );

    const waistChange = useMemo(
      () => computeWaistChange(filteredData),
      [filteredData]
    );
    const lost = (waistChange?.change ?? 0) < 0;
    const gained = (waistChange?.change ?? 0) > 0;

    return (
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 px-8 py-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <Ruler className="h-7 w-7 text-white" />
            <h2 className="text-white text-2xl font-bold">
              Evolución de Cintura
            </h2>
            <Badge className="bg-white/20 text-white border-white/30">
              {filteredData.length} registros
            </Badge>
          </div>
        </div>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 lg:flex-row">
              <div className="w-full max-w-2xl">
                <div
                  ref={chartRef}
                  style={{ width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT }}
                >
                  <NutritionChart
                    data={filteredData}
                    width={CAPTURE_WIDTH}
                    height={CAPTURE_HEIGHT}
                    metric="waist"
                  />
                </div>
              </div>
              {waistChange && (
                <section
                  aria-label="Cambio de cintura"
                  className={cn(
                    "w-full max-w-xs rounded-lg border px-5 py-4 text-center",
                    lost && "border-green-200 bg-green-50 text-green-800",
                    gained && "border-amber-200 bg-amber-50 text-amber-800",
                    !lost && !gained && "border-gray-200 bg-gray-50 text-gray-700"
                  )}
                >
                  <p className="text-sm font-medium">
                    {lost ? "Bajó" : gained ? "Subió" : "Sin cambios"}
                  </p>
                  <p className="text-4xl font-bold tabular-nums">
                    {formatSignedCm(waistChange.change)}
                  </p>
                  <p className="mt-1 text-sm tabular-nums">
                    {waistChange.firstWaist.toFixed(1).replace(".", ",")} →{" "}
                    {waistChange.lastWaist.toFixed(1).replace(".", ",")} cm
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateOnly(waistChange.firstDate)} al{" "}
                    {formatDateOnly(waistChange.lastDate)}
                  </p>
                </section>
              )}
            </div>
          ) : (
            <p className="text-center py-8">
              No hay medidas de cintura en este rango de fechas
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default WaistEvolutionCard;
