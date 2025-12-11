import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../Select/StatusBadge";
import { AppointmentFullResponseDto, AppointmentStatus, ALLOWED_TRANSITIONS } from "@/types/Appointment/Appointment";
import { formatDateAR, formatTimeAR } from "@/common/helpers/timezone";
import { Calendar, Clock, User, Stethoscope, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: AppointmentFullResponseDto;
  onChangeStatus?: (id: number, status: AppointmentStatus) => void;
  onEdit?: (appointment: AppointmentFullResponseDto) => void;
  onDelete?: (id: number) => void;
  onView?: (appointment: AppointmentFullResponseDto) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export const AppointmentCard = ({
  appointment,
  onChangeStatus,
  onEdit,
  onDelete,
  onView,
  compact = false,
  showActions = true,
  className
}: AppointmentCardProps) => {
  const allowedTransitions = ALLOWED_TRANSITIONS[appointment.status] || [];

  const getStatusAction = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.WAITING:
        return { label: "Marcar en espera", icon: "⏳" };
      case AppointmentStatus.ATTENDING:
        return { label: "Atender ahora", icon: "👨‍⚕️" };
      case AppointmentStatus.COMPLETED:
        return { label: "Marcar completado", icon: "✅" };
      case AppointmentStatus.CANCELLED_BY_PATIENT:
        return { label: "Cancelar (paciente)", icon: "❌" };
      case AppointmentStatus.CANCELLED_BY_SECRETARY:
        return { label: "Cancelar (secretaria)", icon: "❌" };
      default:
        return { label: status, icon: "•" };
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            {formatTimeAR(appointment.hour)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={appointment.status} size="sm" />
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(appointment)}>
                    Ver detalles
                  </DropdownMenuItem>
                )}
                {allowedTransitions.length > 0 && onChangeStatus && (
                  <>
                    <DropdownMenuSeparator />
                    {allowedTransitions.map((status) => {
                      const action = getStatusAction(status);
                      return (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onChangeStatus(appointment.id, status)}
                        >
                          {action.icon} {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateAR(appointment.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeAR(appointment.hour)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                {appointment.doctor?.specialities && appointment.doctor.specialities.length > 0 && (
                  <span className="text-xs"> - {appointment.doctor.specialities[0].name}</span>
                )}
              </span>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(appointment)}>
                    Ver detalles
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(appointment)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {allowedTransitions.length > 0 && onChangeStatus && (
                  <>
                    <DropdownMenuSeparator />
                    {allowedTransitions.map((status) => {
                      const action = getStatusAction(status);
                      return (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onChangeStatus(appointment.id, status)}
                        >
                          {action.icon} {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(appointment.id)}
                      className="text-destructive"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
