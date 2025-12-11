import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useAvailableSlots } from "@/hooks/Appointments";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAR } from "@/common/helpers/timezone";

interface TimeSlotSelectProps {
  doctorId?: number;
  date?: string;
  value?: string;
  onValueChange: (hour: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showUnavailable?: boolean;
}

export const TimeSlotSelect = ({
  doctorId,
  date,
  value,
  onValueChange,
  placeholder = "Seleccionar horario",
  disabled = false,
  className,
  showUnavailable = false
}: TimeSlotSelectProps) => {
  const isEnabled = !!doctorId && doctorId > 0 && !!date;

  const { slots, availableSlots, isLoading } = useAvailableSlots({
    doctorId: doctorId || 0,
    date: date || "",
    enabled: isEnabled
  });

  if (isLoading && isEnabled) {
    return <Skeleton className="h-10 w-full" />;
  }

  const slotsToShow = showUnavailable ? slots : availableSlots;

  // Si no está habilitado (falta doctor o fecha), mostrar placeholder
  if (!isEnabled) {
    return (
      <Select disabled={true}>
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Seleccione médico y fecha primero</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {slotsToShow.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No hay horarios disponibles para esta fecha
          </div>
        ) : (
          slotsToShow.map((slot) => (
            <SelectItem
              key={slot.hour}
              value={slot.hour}
              disabled={!slot.available && showUnavailable}
              className={!slot.available ? "text-muted-foreground" : ""}
            >
              <div className="flex items-center gap-2">
                <span>{formatTimeAR(slot.hour)}</span>
                {!slot.available && showUnavailable && (
                  <span className="text-xs text-red-500">(Ocupado)</span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default TimeSlotSelect;
