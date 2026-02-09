import { useMemo } from "react";
import { useDoctorAvailabilities } from "@/hooks/DoctorAvailability";
import { AvailabilityCard } from "./AvailabilityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX } from "lucide-react";
import { DoctorAvailabilityResponseDto, RecurrenceType, WeekDays } from "@/types/DoctorAvailability";

interface AvailabilityListProps {
  doctorId: number;
  onDelete: (id: number) => void;
  onEdit?: (availability: DoctorAvailabilityResponseDto) => void;
  isDeleting?: boolean;
}

// Orden de días de la semana (Lunes = 1, Domingo = 7)
const DAY_ORDER: Record<WeekDays, number> = {
  [WeekDays.MONDAY]: 1,
  [WeekDays.TUESDAY]: 2,
  [WeekDays.WEDNESDAY]: 3,
  [WeekDays.THURSDAY]: 4,
  [WeekDays.FRIDAY]: 5,
  [WeekDays.SATURDAY]: 6,
  [WeekDays.SUNDAY]: 7,
};

// Orden de tipo de recurrencia (WEEKLY primero, luego otros)
const RECURRENCE_ORDER: Record<RecurrenceType, number> = {
  [RecurrenceType.WEEKLY]: 1,
  [RecurrenceType.DAILY]: 2,
  [RecurrenceType.MONTHLY]: 3,
  [RecurrenceType.NONE]: 4,
};

export const AvailabilityList = ({
  doctorId,
  onDelete,
  onEdit,
  isDeleting = false
}: AvailabilityListProps) => {
  const { availabilities, isLoading } = useDoctorAvailabilities({
    doctorId,
    enabled: doctorId > 0
  });

  // Ordenar disponibilidades: por tipo de recurrencia, luego por día de semana, luego por hora
  const sortedAvailabilities = useMemo(() => {
    return [...availabilities].sort((a, b) => {
      // 1. Primero por tipo de recurrencia (WEEKLY primero)
      const aRecurrenceOrder = RECURRENCE_ORDER[a.recurrenceType] ?? 99;
      const bRecurrenceOrder = RECURRENCE_ORDER[b.recurrenceType] ?? 99;
      if (aRecurrenceOrder !== bRecurrenceOrder) {
        return aRecurrenceOrder - bRecurrenceOrder;
      }

      // 2. Luego por día de semana (para WEEKLY)
      const aDay = a.daysOfWeek?.[0] ? DAY_ORDER[a.daysOfWeek[0]] : 99;
      const bDay = b.daysOfWeek?.[0] ? DAY_ORDER[b.daysOfWeek[0]] : 99;
      if (aDay !== bDay) {
        return aDay - bDay;
      }

      // 3. Finalmente por hora de inicio
      return a.startTime.localeCompare(b.startTime);
    });
  }, [availabilities]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (availabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Sin horarios configurados</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Este médico no tiene horarios de atención configurados.
          <br />
          Agregue una disponibilidad para poder asignar turnos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedAvailabilities.map((availability) => (
        <AvailabilityCard
          key={availability.id}
          availability={availability}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

export default AvailabilityList;
