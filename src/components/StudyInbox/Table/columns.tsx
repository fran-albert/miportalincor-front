import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateAR } from "@/common/helpers/timezone";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";
import { STATUS_META } from "../status";

interface GetColumnsArgs {
  onReview: (item: StudyInboxItem) => void;
}

export const getColumns = ({
  onReview,
}: GetColumnsArgs): ColumnDef<StudyInboxItem>[] => [
  {
    accessorKey: "detectedPatientName",
    header: "Paciente detectado",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {row.original.detectedPatientName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "detectedLabFicha",
    header: "Ficha / Ingreso",
    cell: ({ row }) => (
      <span className="text-gray-600">
        {row.original.detectedLabFicha || "—"} /{" "}
        {row.original.detectedLabIngreso || "—"}
      </span>
    ),
  },
  {
    accessorKey: "detectedStudyDate",
    header: "Fecha",
    // La fecha del estudio es una fecha "pelada" (sin hora). Tomamos los
    // primeros 10 caracteres (YYYY-MM-DD) para que formatDateAR la trate como
    // date-only y no le reste un día por la conversión de zona horaria.
    cell: ({ row }) =>
      row.original.detectedStudyDate
        ? formatDateAR(row.original.detectedStudyDate.slice(0, 10))
        : "—",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const meta = STATUS_META[row.original.status];
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-greenPrimary hover:bg-greenPrimary/10"
          onClick={() => onReview(row.original)}
        >
          <Eye className="h-4 w-4" />
          Revisar
        </Button>
      </div>
    ),
  },
];
