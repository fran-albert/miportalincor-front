import { ColumnDef } from "@tanstack/react-table";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import ActivityQrDialog from "./ActivityQrDialog";

export const getActivityColumns = (
  programId: string,
  isAdmin: boolean,
  onDelete: (activityId: string) => void
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
        <ActivityQrDialog
          programId={programId}
          activityId={row.original.id}
          activityName={row.original.name}
        />
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    ),
  },
];
