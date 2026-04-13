import { useMemo } from "react";
import { CalendarRange } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorScheduleExceptions } from "@/hooks/DoctorScheduleException";
import { DoctorScheduleExceptionResponseDto } from "@/types/DoctorScheduleException";
import { DoctorScheduleExceptionCard } from "./DoctorScheduleExceptionCard";

interface DoctorScheduleExceptionListProps {
  doctorId: number;
  onEdit: (exception: DoctorScheduleExceptionResponseDto) => void;
  onDelete: (exception: DoctorScheduleExceptionResponseDto) => void;
  onToggleActive: (exception: DoctorScheduleExceptionResponseDto) => void;
  isMutating?: boolean;
}

export const DoctorScheduleExceptionList = ({
  doctorId,
  onEdit,
  onDelete,
  onToggleActive,
  isMutating = false,
}: DoctorScheduleExceptionListProps) => {
  const { exceptions, isLoading, isError, error } = useDoctorScheduleExceptions({
    doctorId,
    enabled: doctorId > 0,
  });

  const sortedExceptions = useMemo(() => {
    return [...exceptions].sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }

      const dateCompare = left.date.localeCompare(right.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return left.startTime.localeCompare(right.startTime);
    });
  }, [exceptions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        No se pudieron cargar las excepciones por fecha.
        {error instanceof Error ? ` ${error.message}` : ""}
      </div>
    );
  }

  if (sortedExceptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarRange className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Sin excepciones por fecha</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use este bloque cuando el médico necesite atender un día puntual con
          un horario distinto al habitual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedExceptions.map((exception) => (
        <DoctorScheduleExceptionCard
          key={exception.id}
          exception={exception}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          isMutating={isMutating}
        />
      ))}
    </div>
  );
};

export default DoctorScheduleExceptionList;
