import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { integralDaySummary } from "@/common/helpers/integral-checkup-moments";
import { INTEGRAL_CHECKUP_LABEL } from "@/common/constants/integral-checkup";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";

/**
 * Los días del control ginecológico integral, para elegir uno.
 *
 * 🔴 En el control **no se elige la hora**: hay una sola por día y la pone la
 * grilla. Lo único que se elige es el DÍA, y cada día muestra sus dos horas
 * —consulta y ecografía— antes de elegirlo.
 *
 * Las dos horas salen del backend y se ordenan por reloj: la separación entre
 * la consulta y la eco no es un número fijo (el miércoles la consulta dura 20
 * minutos y el jueves 30) y el orden ya se invirtió una vez. Si el front las
 * calculara, mentiría.
 *
 * Lo usan los dos caminos —el alta del control y la reprogramación— porque son
 * la misma elección: si se duplicara, uno de los dos volvería a ofrecer algo
 * que el backend rechaza.
 */

export interface IntegralCheckupDayPickerProps {
  days: IntegralCheckupSlot[];
  isLoading?: boolean;
  isError?: boolean;
  /** `YYYY-MM-DD` del día elegido, o `null`. */
  selectedDate: string | null;
  onSelect: (day: IntegralCheckupSlot) => void;
  /**
   * El día donde el control ya está, cuando se lo está reprogramando. Se marca
   * para que quien mueve el turno vea dónde está parado.
   */
  currentDate?: string;
}

/** `2027-03-10` → `martes 10 de marzo de 2027`. */
const formatLongDate = (date: string): string => {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const IntegralCheckupDayPicker = ({
  days,
  isLoading = false,
  isError = false,
  selectedDate,
  onSelect,
  currentDate,
}: IntegralCheckupDayPickerProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudieron cargar los días</AlertTitle>
        <AlertDescription>Volvé a intentar en unos segundos.</AlertDescription>
      </Alert>
    );
  }

  if (days.length === 0) {
    return (
      <Alert>
        <AlertTitle>Sin días disponibles</AlertTitle>
        <AlertDescription>
          Por ahora no hay fechas libres para el{" "}
          {INTEGRAL_CHECKUP_LABEL.toLowerCase()}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
      {days.map((day) => (
        <button
          key={day.date}
          type="button"
          aria-pressed={selectedDate === day.date}
          onClick={() => onSelect(day)}
          className={cn(
            "rounded-lg border p-3 text-left text-sm transition-colors",
            selectedDate === day.date
              ? "border-pink-500 bg-pink-50"
              : "hover:bg-muted/50",
          )}
        >
          <span className="block font-medium capitalize">
            {formatLongDate(day.date)}
            {currentDate === day.date && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal normal-case text-muted-foreground">
                día actual
              </span>
            )}
          </span>
          {/* 🔴 Las dos horas, en la fecha misma: se ven sin tener que elegir
              el día para enterarse. Salen del backend y se ordenan por reloj. */}
          <span className="block text-xs text-muted-foreground">
            {integralDaySummary(day)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default IntegralCheckupDayPicker;
