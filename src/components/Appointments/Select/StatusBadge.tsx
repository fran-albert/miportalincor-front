import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusColors
} from "@/types/Appointment/Appointment";
import {
  OverturnStatus,
  OverturnStatusLabels,
  OverturnStatusColors
} from "@/types/Overturn/Overturn";
import {
  PatientAppointmentStatusColors,
  PatientAppointmentStatusLabels,
  PatientOverturnStatusColors,
  PatientOverturnStatusLabels
} from "@/common/constants/patient-appointment-status";

/**
 * Quién está mirando el badge. El default es `staff` a propósito: los call
 * sites del backoffice (turnero, tabla, sala de espera, agenda impresa, ficha
 * del paciente) no se tocan y siguen renderizando exactamente lo de siempre.
 * Sólo el portal del paciente pide `patient`.
 */
type StatusBadgeAudience = 'staff' | 'patient';

interface StatusBadgeProps {
  status: AppointmentStatus | OverturnStatus;
  type?: 'appointment' | 'overturn';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  audience?: StatusBadgeAudience;
}

export const StatusBadge = ({
  status,
  type = 'appointment',
  className,
  size = 'md',
  audience = 'staff'
}: StatusBadgeProps) => {
  const isPatient = audience === 'patient';

  const label = type === 'appointment'
    ? (isPatient ? PatientAppointmentStatusLabels : AppointmentStatusLabels)[status as AppointmentStatus]
    : (isPatient ? PatientOverturnStatusLabels : OverturnStatusLabels)[status as OverturnStatus];

  const colorClass = type === 'appointment'
    ? (isPatient ? PatientAppointmentStatusColors : AppointmentStatusColors)[status as AppointmentStatus]
    : (isPatient ? PatientOverturnStatusColors : OverturnStatusColors)[status as OverturnStatus];

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-0",
        colorClass,
        sizeClass[size],
        className
      )}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
