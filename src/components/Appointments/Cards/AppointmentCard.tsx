import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../Select/StatusBadge";
import { AppointmentFullResponseDto, AppointmentStatus, ALLOWED_TRANSITIONS } from "@/types/Appointment/Appointment";
import { formatDateAR, formatTimeAR } from "@/common/helpers/timezone";
import { Calendar, Clock, User, Stethoscope, MoreVertical, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDoctorName } from "@/common/helpers/helpers";

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

  // Backend returns 0/1 (numbers) not true/false (booleans)
  const isGuestAppointment = appointment.isGuest === 1 || appointment.isGuest === true;

  // Helper to get patient display name
  const getPatientName = () => {
    if (isGuestAppointment) {
      return `${appointment.guestFirstName || ''} ${appointment.guestLastName || ''}`;
    }
    return `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`;
  };

  // Helper to get patient DNI
  const getPatientDNI = () => {
    if (isGuestAppointment) {
      return appointment.guestDocumentNumber || '';
    }
    return appointment.patient?.userName || '';
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
          isGuestAppointment && "border-l-4 border-l-purple-500",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            {formatTimeAR(appointment.hour)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-2">
              {isGuestAppointment && <span>🆕</span>}
              {getPatientName()}
            </span>
            <span className="text-xs text-muted-foreground">
              {appointment.doctor && formatDoctorName(appointment.doctor)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isGuestAppointment && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
              <UserPlus className="w-3 h-3 mr-1" />
              INVITADO
            </Badge>
          )}
          {appointment.consultationType && (
            <Badge
              className="border text-xs"
              style={{
                backgroundColor: appointment.consultationType.color ? `${appointment.consultationType.color}20` : undefined,
                color: appointment.consultationType.color || undefined,
                borderColor: appointment.consultationType.color || undefined,
              }}
            >
              {appointment.consultationType.name}
            </Badge>
          )}
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
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      isGuestAppointment && "border-l-4 border-l-purple-500",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={appointment.status} />
              {isGuestAppointment && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  <UserPlus className="w-3 h-3 mr-1" />
                  INVITADO
                </Badge>
              )}
              {appointment.consultationType && (
                <Badge
                  className="border"
                  style={{
                    backgroundColor: appointment.consultationType.color ? `${appointment.consultationType.color}20` : undefined,
                    color: appointment.consultationType.color || undefined,
                    borderColor: appointment.consultationType.color || undefined,
                  }}
                >
                  {appointment.consultationType.name}
                </Badge>
              )}
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
                {getPatientName()}
              </span>
              <span className="text-xs text-muted-foreground">
                (DNI: {getPatientDNI()})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {appointment.doctor && formatDoctorName(appointment.doctor)}
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
