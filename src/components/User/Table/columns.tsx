import { ColumnDef } from "@tanstack/react-table";
import { formatDni } from "@/common/helpers/helpers";
import { User } from "@/types/User/User";
import { Badge } from "@/components/ui/badge";
import ToggleUserStatusDialog from "../ToggleUserStatusDialog";
import ResetPasswordDialog from "../ResetPasswordDialog";

export const getColumns = (
  onStatusChange: () => void,
  currentUserId: number
): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div className="text-sm">{index + 1}</div>;
      },
    },
    {
      accessorKey: "firstName",
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {row.original.lastName}, {row.original.firstName}
          </p>
          <span
            style={{ fontSize: "0.75rem" }}
            className="text-gray-900 font-bold"
          >
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "dni",
      header: "D.N.I.",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {formatDni(row.original.userName)}
          </p>
        </div>
      ),
    },
    {
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{row.original.phoneNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {roles.map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge variant={row.original.active ? "success" : "destructive"}>
            {row.original.active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const isCurrentUser = row.original.userId === currentUserId;

        return (
          <div className="flex items-center justify-end gap-2">
            {!isCurrentUser && (
              <>
                <ResetPasswordDialog
                  user={row.original}
                  onSuccess={onStatusChange}
                />
                <ToggleUserStatusDialog
                  user={row.original}
                  onSuccess={onStatusChange}
                />
              </>
            )}
            {isCurrentUser && (
              <span className="text-xs text-gray-500 italic">
                (Tu usuario)
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
