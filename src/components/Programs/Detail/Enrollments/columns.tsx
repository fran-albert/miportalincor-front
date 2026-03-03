import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import {
  ProgramEnrollment,
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
} from "@/types/Program/ProgramEnrollment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const getEnrollmentColumns = (
  programId: string,
  isAdmin: boolean,
  onChangeStatus: (enrollment: ProgramEnrollment) => void
): ColumnDef<ProgramEnrollment>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "patient",
    header: "Paciente",
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div>
          <div className="font-medium">
            {patient
              ? `${patient.firstName} ${patient.lastName}`
              : row.original.patientUserId}
          </div>
          {patient?.email && (
            <div className="text-sm text-gray-500">{patient.email}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "enrolledAt",
    header: "Fecha inscripción",
    cell: ({ row }) => {
      try {
        return format(new Date(row.original.enrolledAt), "dd/MM/yyyy", {
          locale: es,
        });
      } catch {
        return row.original.enrolledAt;
      }
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge
        className={EnrollmentStatusColors[row.original.status]}
      >
        {EnrollmentStatusLabels[row.original.status]}
      </Badge>
    ),
  },
  {
    header: " ",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Link
          to={`/programas/${programId}/inscripciones/${row.original.id}`}
        >
          <Button variant="ghost" size="icon" title="Ver detalle">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            title="Cambiar estado"
            onClick={() => onChangeStatus(row.original)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },
];
