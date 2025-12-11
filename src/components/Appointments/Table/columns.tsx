import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../Select/StatusBadge";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  ALLOWED_TRANSITIONS
} from "@/types/Appointment/Appointment";
import { formatDateAR, formatTimeAR } from "@/common/helpers/timezone";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsConfig {
  onView?: (appointment: AppointmentFullResponseDto) => void;
  onEdit?: (appointment: AppointmentFullResponseDto) => void;
  onChangeStatus?: (id: number, status: AppointmentStatus) => void;
  onDelete?: (id: number) => void;
}

export const getAppointmentColumns = (config: ColumnsConfig): ColumnDef<AppointmentFullResponseDto>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDateAR(row.getValue("date")),
  },
  {
    accessorKey: "hour",
    header: "Hora",
    cell: ({ row }) => formatTimeAR(row.getValue("hour")),
  },
  {
    accessorKey: "patient",
    header: "Paciente",
    cell: ({ row }) => {
      const patient = row.original.patient;
      return patient ? `${patient.firstName} ${patient.lastName}` : "-";
    },
  },
  {
    accessorKey: "doctor",
    header: "Médico",
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} size="sm" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      const allowedTransitions = ALLOWED_TRANSITIONS[appointment.status] || [];

      const getStatusLabel = (status: AppointmentStatus) => {
        switch (status) {
          case AppointmentStatus.WAITING:
            return "Marcar en espera";
          case AppointmentStatus.ATTENDING:
            return "Atender";
          case AppointmentStatus.COMPLETED:
            return "Completar";
          case AppointmentStatus.CANCELLED_BY_PATIENT:
            return "Cancelar (paciente)";
          case AppointmentStatus.CANCELLED_BY_SECRETARY:
            return "Cancelar (secretaria)";
          default:
            return status;
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {config.onView && (
              <DropdownMenuItem onClick={() => config.onView!(appointment)}>
                Ver detalles
              </DropdownMenuItem>
            )}
            {config.onEdit && (
              <DropdownMenuItem onClick={() => config.onEdit!(appointment)}>
                Editar turno
              </DropdownMenuItem>
            )}
            {allowedTransitions.length > 0 && config.onChangeStatus && (
              <>
                <DropdownMenuSeparator />
                {allowedTransitions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => config.onChangeStatus!(appointment.id, status)}
                  >
                    {getStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {config.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => config.onDelete!(appointment.id)}
                  className="text-red-600"
                >
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
