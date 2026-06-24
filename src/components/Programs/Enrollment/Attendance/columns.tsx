import { ColumnDef } from "@tanstack/react-table";
import { AttendanceRecord, AttendanceMethodLabels } from "@/types/Program/Attendance";
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
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.method === "QR"
            ? "bg-blue-50 text-blue-700"
            : "bg-orange-50 text-orange-700"
        }
      >
        {AttendanceMethodLabels[row.original.method]}
      </Badge>
    ),
  },
];
