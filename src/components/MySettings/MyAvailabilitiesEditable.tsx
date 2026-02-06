import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DoctorAvailabilityResponseDto,
  RecurrenceTypeLabels,
  WeekDaysShort,
  WeekDays,
  RecurrenceType
} from "@/types/DoctorAvailability";
import { useDoctorAvailabilities } from "@/hooks/DoctorAvailability/useDoctorAvailabilities";
import { useDoctorAvailabilityMutations } from "@/hooks/DoctorAvailability/useDoctorAvailabilityMutations";
import { Clock, Calendar, Repeat, CalendarX, Trash2, AlertCircle } from "lucide-react";
import { formatDateAR } from "@/common/helpers/timezone";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface MyAvailabilitiesEditableProps {
  doctorId: number;
}

const AvailabilityEditableCard = ({
  availability,
  onDelete,
  isDeleting,
}: {
  availability: DoctorAvailabilityResponseDto;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getScheduleDescription = () => {
    switch (availability.recurrenceType) {
      case RecurrenceType.NONE:
        return availability.specificDate
          ? `Fecha: ${formatDateAR(availability.specificDate)}`
          : 'Fecha específica';
      case RecurrenceType.DAILY:
        return 'Todos los días';
      case RecurrenceType.WEEKLY:
        if (availability.daysOfWeek && availability.daysOfWeek.length > 0) {
          return availability.daysOfWeek
            .map(day => WeekDaysShort[day as WeekDays])
            .join(', ');
        }
        return 'Semanal';
      case RecurrenceType.MONTHLY:
        return `Día ${availability.dayOfMonth} de cada mes`;
      default:
        return '';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-greenPrimary">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-greenPrimary/10 text-greenPrimary">
                <Repeat className="h-3 w-3 mr-1" />
                {RecurrenceTypeLabels[availability.recurrenceType]}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{getScheduleDescription()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-greenPrimary" />
              <span className="font-medium">
                {availability.startTime} - {availability.endTime}
              </span>
              <span className="text-muted-foreground">
                (turnos de {availability.slotDuration} min)
              </span>
            </div>

            {(availability.validFrom || availability.validUntil) && (
              <div className="text-xs text-muted-foreground">
                Válido: {availability.validFrom ? formatDateAR(availability.validFrom) : '∞'}
                {' - '}
                {availability.validUntil ? formatDateAR(availability.validUntil) : '∞'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Eliminar Horario
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que querés eliminar este horario? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(availability.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const MyAvailabilitiesEditable = ({ doctorId }: MyAvailabilitiesEditableProps) => {
  const { availabilities, isLoading } = useDoctorAvailabilities({
    doctorId,
    enabled: doctorId > 0
  });
  const { deleteAvailability, isDeleting } = useDoctorAvailabilityMutations();
  const { showSuccess, showError } = useToastContext();

  const handleDelete = async (id: number) => {
    try {
      await deleteAvailability.mutateAsync({ id, doctorId });
      showSuccess("Horario eliminado", "El horario se eliminó correctamente");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar el horario";
      showError("Error", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (availabilities.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarX className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-lg text-muted-foreground">No tenés horarios configurados</p>
        <p className="text-sm text-muted-foreground mt-2">
          Para agregar nuevos horarios, contactá a la secretaría o administrador
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              Gestión de Horarios
            </p>
            <p className="text-xs text-blue-700">
              Podés eliminar horarios existentes. Para agregar nuevos horarios, contactá a la secretaría o administrador.
            </p>
          </div>
        </div>
      </div>

      {availabilities.map((availability, index) => (
        <motion.div
          key={availability.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <AvailabilityEditableCard
            availability={availability}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default MyAvailabilitiesEditable;
