import { Badge, type BadgeProps } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types/Appointment/Appointment";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

// Mapea cada estado a una variante de Badge
const variantMap: Record<AppointmentStatus, BadgeProps["variant"]> = {
  [AppointmentStatus.PENDIENTE]: "warning",
  [AppointmentStatus.CONFIRMADO]: "success",
  [AppointmentStatus.CANCELADO]: "destructive",
  [AppointmentStatus.COMPLETADO]: "default",
};

// Etiquetas en español para cada estado
const labelMap: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDIENTE]: "Pendiente",
  [AppointmentStatus.CONFIRMADO]: "Confirmado",
  [AppointmentStatus.CANCELADO]: "Cancelado",
  [AppointmentStatus.COMPLETADO]: "Completado",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = variantMap[status];
  const label = labelMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}
