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

interface StatusBadgeProps {
  status: AppointmentStatus | OverturnStatus;
  type?: 'appointment' | 'overturn';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({
  status,
  type = 'appointment',
  className,
  size = 'md'
}: StatusBadgeProps) => {
  const label = type === 'appointment'
    ? AppointmentStatusLabels[status as AppointmentStatus]
    : OverturnStatusLabels[status as OverturnStatus];

  const colorClass = type === 'appointment'
    ? AppointmentStatusColors[status as AppointmentStatus]
    : OverturnStatusColors[status as OverturnStatus];

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
