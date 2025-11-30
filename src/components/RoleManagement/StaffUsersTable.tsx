import { ColumnDef } from "@tanstack/react-table";
import { StaffUser } from "@/api/Role/get-staff-users.action";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { formatDni } from "@/common/helpers/helpers";
import { UserCog } from "lucide-react";
import UserRolesDialog from "./UserRolesDialog";

interface StaffUsersTableProps {
  users: StaffUser[];
  isFetching?: boolean;
  onRefetch: () => void;
}

const getColumns = (onRefetch: () => void): ColumnDef<StaffUser>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div className="text-sm">{row.index + 1}</div>,
  },
  {
    accessorKey: "firstName",
    header: "Usuario",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <p className="text-sm font-medium">
          {row.original.lastName}, {row.original.firstName}
        </p>
        <span className="text-xs text-gray-500">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "userName",
    header: "D.N.I.",
    cell: ({ row }) => (
      <div className="text-sm font-medium">{formatDni(String(row.original.userName))}</div>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles || [];
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {roles.length > 0 ? (
            roles.map((role) => (
              <Badge key={role.id} variant="outline" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">Sin roles</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "success" : "destructive"}>
        {row.original.active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <UserRolesDialog user={row.original} onSuccess={onRefetch} />
      </div>
    ),
  },
];

export const StaffUsersTable: React.FC<StaffUsersTableProps> = ({
  users,
  isFetching,
  onRefetch,
}) => {
  const columns = getColumns(onRefetch);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Asignar Roles" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Asignar Roles a Usuarios"
        description="Asigna o quita roles al personal del sistema"
        icon={<UserCog className="h-6 w-6" />}
        badge={users.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Buscar personal..."
          showSearch={true}
          useServerSideSearch={false}
          isFetching={isFetching}
          canAddUser={false}
        />
      </div>
    </div>
  );
};
