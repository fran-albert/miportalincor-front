import { ColumnDef } from "@tanstack/react-table";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import ActivityQrDialog from "./ActivityQrDialog";
import {
  ProgramTariffTypeLabels,
} from "@/types/Program/ProgramActivity";
import { formatCentsToArs } from "@/common/helpers/programMoney";

export const getActivityColumns = (
  programId: string,
  canManageActivities: boolean,
  onDelete: (activityId: string) => void,
  onEdit: (activity: ProgramActivity) => void
): ColumnDef<ProgramActivity>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "name",
    header: "Actividad",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="text-gray-600 max-w-xs truncate">
        {row.original.description || "-"}
      </div>
    ),
  },
  {
    accessorKey: "tariffType",
    header: "Tipo de arancel",
    cell: ({ row }) =>
      row.original.tariffType ? (
        <span>{ProgramTariffTypeLabels[row.original.tariffType]}</span>
      ) : (
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          Sin arancel
        </Badge>
      ),
  },
  {
    accessorKey: "unitPriceCents",
    header: "Precio lista",
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.unitPriceCents === undefined
          ? "—"
          : formatCentsToArs(row.original.unitPriceCents)}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "default" : "secondary"}
        className={
          row.original.isActive
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
      >
        {row.original.isActive ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    header: " ",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {/* El QR lo ve cualquiera con acceso a la pantalla: secretaría/admin
            lo usan para imprimir los pósters de los consultorios */}
        <ActivityQrDialog
          programId={programId}
          activityId={row.original.id}
          activityName={row.original.name}
        />
        {canManageActivities && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${row.original.name}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4 text-slate-600" />
          </Button>
        )}
        {canManageActivities && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ${row.original.name}`}
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    ),
  },
];
