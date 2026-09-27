import { formatDateOnly } from "@/common/helpers/helpers";
import { cn } from "@/lib/utils";
import {
  formatDecimal,
  formatKg,
  formatSignedKg,
  type WeightChange,
} from "./weightChange";

interface WeightChangeSummaryProps {
  weightChange: WeightChange;
}

export const WeightChangeSummary = ({ weightChange }: WeightChangeSummaryProps) => {
  const { change, firstWeight, lastWeight, firstDate, lastDate, toTarget } =
    weightChange;
  const lost = change < 0;
  const gained = change > 0;

  return (
    <section
      aria-label="Kilos descendidos"
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
      <p className="text-4xl font-bold tabular-nums">{formatSignedKg(change)}</p>
      <p className="mt-1 text-sm tabular-nums">
        {formatDecimal(firstWeight)} → {formatKg(lastWeight)}
      </p>
      <p className="text-xs text-gray-600">
        {formatDateOnly(firstDate)} al {formatDateOnly(lastDate)}
      </p>
      {toTarget !== null && (
        <p className="mt-3 border-t border-black/10 pt-2 text-sm text-gray-700">
          Faltan {formatKg(toTarget)} para el peso objetivo
        </p>
      )}
    </section>
  );
};
