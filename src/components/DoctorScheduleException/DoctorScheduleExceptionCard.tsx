import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  formatDateWithWeekdayAR,
  isPastDateAR,
} from "@/common/helpers/timezone";
import { DoctorScheduleExceptionResponseDto } from "@/types/DoctorScheduleException";

interface DoctorScheduleExceptionCardProps {
  exception: DoctorScheduleExceptionResponseDto;
  onEdit: (exception: DoctorScheduleExceptionResponseDto) => void;
  onDelete: (exception: DoctorScheduleExceptionResponseDto) => void;
  onToggleActive: (exception: DoctorScheduleExceptionResponseDto) => void;
  isMutating?: boolean;
}

export const DoctorScheduleExceptionCard = ({
  exception,
  onEdit,
  onDelete,
  onToggleActive,
  isMutating = false,
}: DoctorScheduleExceptionCardProps) => {
  const isPast = isPastDateAR(exception.date);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={exception.isActive ? "default" : "secondary"}>
                {exception.isActive ? "Activa" : "Inactiva"}
              </Badge>
              {isPast && (
                <Badge variant="outline" className="text-muted-foreground">
                  Fecha pasada
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">
                {formatDateWithWeekdayAR(exception.date)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-greenPrimary" />
              <span className="font-medium">
                {exception.startTime} - {exception.endTime}
              </span>
              <span className="text-muted-foreground">
                (turnos de {exception.slotDuration} min)
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Reemplaza el horario habitual solo para esta fecha.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isMutating}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(exception)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(exception)}>
                {exception.isActive ? (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reactivar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(exception)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorScheduleExceptionCard;
