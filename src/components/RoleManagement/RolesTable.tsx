import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@/api/Role/get-all-roles.action";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

interface RolesTableProps {
  roles: Role[];
  isFetching?: boolean;
  onRefetch: () => void;
}

const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-sm font-medium">{row.original.id}</div>,
  },
  {
    accessorKey: "name",
    header: "Nombre del Rol",
    cell: ({ row }) => (
      <div className="text-sm font-medium">{row.original.name}</div>
    ),
  },
];

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  isFetching,
}) => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Gestión de Roles" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Gestión de Roles"
        description="Visualiza los roles disponibles en el sistema"
        icon={<Shield className="h-6 w-6" />}
        badge={roles.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={roles}
          searchPlaceholder="Buscar roles..."
          showSearch={true}
          useServerSideSearch={false}
          isFetching={isFetching}
          canAddUser={false}
        />
      </div>
    </div>
  );
};
