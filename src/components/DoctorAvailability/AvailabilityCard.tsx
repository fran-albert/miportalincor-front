import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DoctorAvailabilityResponseDto,
  RecurrenceTypeLabels,
  WeekDaysShort,
  WeekDays
} from "@/types/DoctorAvailability";
import { Trash2, Clock, Calendar, Repeat, Pencil } from "lucide-react";
import { formatDateAR } from "@/common/helpers/timezone";

interface AvailabilityCardProps {
  availability: DoctorAvailabilityResponseDto;
  onDelete: (id: number) => void;
  onEdit?: (availability: DoctorAvailabilityResponseDto) => void;
  isDeleting?: boolean;
}

export const AvailabilityCard = ({
  availability,
  onDelete,
  onEdit,
  isDeleting = false
}: AvailabilityCardProps) => {
  const getScheduleDescription = () => {
    switch (availability.recurrenceType) {
      case 'NONE':
        return availability.specificDate
          ? `Fecha: ${formatDateAR(availability.specificDate)}`
          : 'Fecha específica';
      case 'DAILY':
        return 'Todos los días';
      case 'WEEKLY':
        if (availability.daysOfWeek && availability.daysOfWeek.length > 0) {
          return availability.daysOfWeek
            .map(day => WeekDaysShort[day as WeekDays])
            .join(', ');
        }
        return 'Semanal';
      case 'MONTHLY':
        return `Día ${availability.dayOfMonth} de cada mes`;
      default:
        return '';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
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

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onEdit(availability)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(availability.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;
