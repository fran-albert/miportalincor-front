import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateAR, formatTimeFromDateAR } from "@/common/helpers/timezone";
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
    // Si el PDF no se pudo parsear, el asunto del correo es la unica forma de
    // saber de quien es el estudio: se muestra como linea secundaria.
    cell: ({ row }) => {
      const { detectedPatientName, detectedDni, emailSubject } = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {detectedPatientName || emailSubject || "—"}
          </span>
          {detectedPatientName && detectedDni && (
            <span className="text-xs text-gray-500">DNI {detectedDni}</span>
          )}
          {!detectedPatientName && emailSubject && (
            <span className="text-xs text-gray-500">Asunto del correo</span>
          )}
        </div>
      );
    },
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
    accessorKey: "createdAt",
    header: "Recibido",
    cell: ({ row }) =>
      row.original.createdAt ? (
        <span className="text-gray-600">
          {formatDateAR(row.original.createdAt)}{" "}
          <span className="text-xs text-gray-400">
            {formatTimeFromDateAR(row.original.createdAt)}
          </span>
        </span>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "detectedStudyDate",
    header: "Fecha estudio",
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
      return (
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {row.original.onHold && (
            <Badge variant="destructive">Retenido</Badge>
          )}
        </div>
      );
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
