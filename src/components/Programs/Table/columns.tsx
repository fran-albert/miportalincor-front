import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Program } from "@/types/Program/Program";
import { Badge } from "@/components/ui/badge";
import { EditButtonIcon } from "@/components/Button/Edit/button";
import DeleteProgramDialog from "../Delete";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const getColumns = (
  isAdmin: boolean,
  onEdit: (program: Program) => void
): ColumnDef<Program>[] => {
  const columns: ColumnDef<Program>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <Link
          to={`/programas/${row.original.id}`}
          className="font-medium text-greenPrimary hover:underline"
        >
          {row.original.name}
        </Link>
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
          {row.original.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/programas/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {isAdmin && (
            <>
              <EditButtonIcon onClick={() => onEdit(row.original)} />
              <DeleteProgramDialog program={row.original} />
            </>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
