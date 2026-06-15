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
  total: number;
  page: number;
  limit: number;
  isFetching?: boolean;
  search: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
}

const columns: ColumnDef<StaffUser>[] = [
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
      <div className="text-sm font-medium">
        {formatDni(String(row.original.userName))}
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
          {roles.length > 0 ? (
            roles.map((role) => (
              <Badge key={role.id} variant="outline" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Sin roles
            </span>
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
        <UserRolesDialog user={row.original} />
      </div>
    ),
  },
];

export const StaffUsersTable: React.FC<StaffUsersTableProps> = ({
  users,
  total,
  page,
  limit,
  isFetching,
  search,
  onSearchChange,
  onPageChange,
}) => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Asignar Roles" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Asignar Roles a Usuarios"
        description="Asigna o quita roles al personal del sistema"
        icon={<UserCog className="h-6 w-6" />}
        badge={total}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Buscar por nombre, apellido o DNI..."
          showSearch={true}
          useServerSideSearch={true}
          setSearch={onSearchChange}
          searchQuery={search}
          showDataOnEmptySearch={true}
          isFetching={isFetching}
          canAddUser={false}
          clientPageSize={limit}
          currentPage={page}
          totalPages={totalPages}
          onNextPage={() => {
            if (page < totalPages) onPageChange(page + 1);
          }}
          onPrevPage={() => {
            if (page > 1) onPageChange(page - 1);
          }}
        />
      </div>
    </div>
  );
};
