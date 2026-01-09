import { useDoctorAvailabilities } from "@/hooks/DoctorAvailability";
import { AvailabilityCard } from "./AvailabilityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX } from "lucide-react";

interface AvailabilityListProps {
  doctorId: number;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export const AvailabilityList = ({
  doctorId,
  onDelete,
  isDeleting = false
}: AvailabilityListProps) => {
  const { availabilities, isLoading } = useDoctorAvailabilities({
    doctorId,
    enabled: doctorId > 0
  });

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
      {availabilities.map((availability) => (
        <AvailabilityCard
          key={availability.id}
          availability={availability}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

export default AvailabilityList;
