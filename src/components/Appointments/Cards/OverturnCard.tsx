import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "../Select/StatusBadge";
import { OverturnDetailedDto, OverturnStatus, ALLOWED_OVERTURN_TRANSITIONS } from "@/types/Overturn/Overturn";
import { formatDateAR, formatTimeAR } from "@/common/helpers/timezone";
import { Calendar, Clock, User, Stethoscope, MoreVertical, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OverturnCardProps {
  overturn: OverturnDetailedDto;
  onChangeStatus?: (id: number, status: OverturnStatus) => void;
  onDelete?: (id: number) => void;
  onView?: (overturn: OverturnDetailedDto) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export const OverturnCard = ({
  overturn,
  onChangeStatus,
  onDelete,
  onView,
  compact = false,
  showActions = true,
  className
}: OverturnCardProps) => {
  const allowedTransitions = ALLOWED_OVERTURN_TRANSITIONS[overturn.status] || [];

  const getStatusAction = (status: OverturnStatus) => {
    switch (status) {
      case OverturnStatus.WAITING:
        return { label: "Marcar en espera", icon: "⏳" };
      case OverturnStatus.ATTENDING:
        return { label: "Atender ahora", icon: "👨‍⚕️" };
      case OverturnStatus.COMPLETED:
        return { label: "Marcar completado", icon: "✅" };
      case OverturnStatus.CANCELLED_BY_PATIENT:
        return { label: "Cancelar (paciente)", icon: "❌" };
      case OverturnStatus.CANCELLED_BY_SECRETARY:
        return { label: "Cancelar (secretaria)", icon: "❌" };
      default:
        return { label: status, icon: "•" };
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-l-orange-500",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            {formatTimeAR(overturn.hour)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1">
              {overturn.patient?.firstName} {overturn.patient?.lastName}
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 ml-1">
                Sobreturno
              </Badge>
            </span>
            <span className="text-xs text-muted-foreground">
              Dr. {overturn.doctor?.firstName} {overturn.doctor?.lastName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={overturn.status} type="overturn" size="sm" />
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(overturn)}>
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
                          onClick={() => onChangeStatus(overturn.id, status)}
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
    <Card className={cn("hover:shadow-md transition-shadow border-l-4 border-l-orange-500", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={overturn.status} type="overturn" />
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Sobreturno
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateAR(overturn.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeAR(overturn.hour)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {overturn.patient?.firstName} {overturn.patient?.lastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Dr. {overturn.doctor?.firstName} {overturn.doctor?.lastName}
                {overturn.doctor?.specialities && overturn.doctor.specialities.length > 0 && (
                  <span className="text-xs"> - {overturn.doctor.specialities[0].name}</span>
                )}
              </span>
            </div>

            {overturn.reason && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                <span className="font-medium">Motivo:</span> {overturn.reason}
              </div>
            )}
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
                  <DropdownMenuItem onClick={() => onView(overturn)}>
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
                          onClick={() => onChangeStatus(overturn.id, status)}
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
                      onClick={() => onDelete(overturn.id)}
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

export default OverturnCard;
