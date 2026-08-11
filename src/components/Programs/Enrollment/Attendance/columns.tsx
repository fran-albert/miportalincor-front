import { ColumnDef } from "@tanstack/react-table";
import {
  AttendanceRecord,
  AttendanceMethod,
  AttendanceMethodLabels,
} from "@/types/Program/Attendance";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const getAttendanceColumns = (): ColumnDef<AttendanceRecord>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "activityName",
    header: "Actividad",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.activityName || "-"}</div>
    ),
  },
  {
    accessorKey: "attendedAt",
    header: "Fecha",
    cell: ({ row }) => {
      try {
        return format(
          new Date(row.original.attendedAt),
          "dd/MM/yyyy HH:mm",
          { locale: es }
        );
      } catch {
        return row.original.attendedAt;
      }
    },
  },
  {
    accessorKey: "withoutActivePlan",
    header: "Plan",
    cell: ({ row }) =>
      // Sin plan vigente no hay denominador: la asistencia cuenta, pero el
      // cumplimiento no se puede medir hasta que se cargue el plan.
      row.original.withoutActivePlan ? (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-800"
        >
          Sin plan vigente
        </Badge>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.method === AttendanceMethod.QR_SCAN
            ? "bg-blue-50 text-blue-700"
            : "bg-orange-50 text-orange-700"
        }
      >
        {AttendanceMethodLabels[row.original.method]}
      </Badge>
    ),
  },
];
