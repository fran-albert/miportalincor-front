import { Badge, type BadgeProps } from "@/components/ui/badge";
import { AppointmentStatus, AppointmentStatusLabels } from "@/types/Appointment/Appointment";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

// Mapea cada estado a una variante de Badge
const variantMap: Record<AppointmentStatus, BadgeProps["variant"]> = {
  [AppointmentStatus.REQUESTED_BY_PATIENT]: "outline",
  [AppointmentStatus.ASSIGNED_BY_SECRETARY]: "secondary",
  [AppointmentStatus.PENDING]: "warning",
  [AppointmentStatus.WAITING]: "greenPrimary",
  [AppointmentStatus.ATTENDING]: "success",
  [AppointmentStatus.COMPLETED]: "default",
  [AppointmentStatus.CANCELLED_BY_PATIENT]: "destructive",
  [AppointmentStatus.CANCELLED_BY_SECRETARY]: "destructive",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = variantMap[status];
  const label = AppointmentStatusLabels[status];
  return <Badge variant={variant}>{label}</Badge>;
}
