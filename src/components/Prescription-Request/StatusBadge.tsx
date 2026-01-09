import { Badge } from "@/components/ui/badge";
import { PrescriptionRequestStatus } from "@/types/Prescription-Request/Prescription-Request";
import { Clock, Loader2, CheckCircle, XCircle, Ban } from "lucide-react";

interface StatusBadgeProps {
  status: PrescriptionRequestStatus;
}

export const getStatusConfig = (status: PrescriptionRequestStatus) => {
  const configs = {
    [PrescriptionRequestStatus.PENDING]: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    [PrescriptionRequestStatus.IN_PROGRESS]: {
      label: "En Progreso",
      className: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Loader2,
    },
    [PrescriptionRequestStatus.COMPLETED]: {
      label: "Completada",
      className: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    [PrescriptionRequestStatus.REJECTED]: {
      label: "Rechazada",
      className: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
    [PrescriptionRequestStatus.CANCELLED]: {
      label: "Cancelada",
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Ban,
    },
  };

  return configs[status] || configs[PrescriptionRequestStatus.PENDING];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1.5`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
