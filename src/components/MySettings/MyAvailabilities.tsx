import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DoctorAvailabilityResponseDto,
  RecurrenceTypeLabels,
  WeekDaysShort,
  WeekDays,
  RecurrenceType
} from "@/types/DoctorAvailability";
import { useDoctorAvailabilities } from "@/hooks/DoctorAvailability/useDoctorAvailabilities";
import { Clock, Calendar, Repeat, CalendarX } from "lucide-react";
import { formatDateAR } from "@/common/helpers/timezone";
import { motion } from "framer-motion";

interface MyAvailabilitiesProps {
  doctorId: number;
}

const AvailabilityReadOnlyCard = ({ availability }: { availability: DoctorAvailabilityResponseDto }) => {
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
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-greenPrimary">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-greenPrimary/10 text-greenPrimary">
              <Repeat className="h-3 w-3 mr-1" />
              {RecurrenceTypeLabels[availability.recurrenceType]}
            </Badge>
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
  );
};

export const MyAvailabilities = ({ doctorId }: MyAvailabilitiesProps) => {
  const { availabilities, isLoading } = useDoctorAvailabilities({
    doctorId,
    enabled: doctorId > 0
  });

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
        <p className="text-sm text-muted-foreground">
          Contactá a la secretaría para configurar tus horarios de atención
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availabilities.map((availability, index) => (
        <motion.div
          key={availability.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <AvailabilityReadOnlyCard availability={availability} />
        </motion.div>
      ))}
    </div>
  );
};

export default MyAvailabilities;
