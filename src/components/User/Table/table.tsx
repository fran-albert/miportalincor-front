import { getColumns } from "./columns";
import { User } from "@/types/User/User";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Users } from "lucide-react";

interface UsersTableProps {
  users: User[];
  isFetching?: boolean;
  onRefetch: () => void;
  currentUserId: number;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isFetching,
  onRefetch,
  currentUserId,
}) => {
  const userColumns = getColumns(onRefetch, currentUserId);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Usuarios del Sistema" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Usuarios del Sistema"
        description="Gestiona el acceso y permisos de los usuarios del sistema"
        icon={<Users className="h-6 w-6" />}
        badge={users.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={userColumns}
          data={users}
          searchPlaceholder="Buscar usuarios..."
          showSearch={true}
          useServerSideSearch={false}
          isFetching={isFetching}
          canAddUser={false}
        />
      </div>
    </div>
  );
};
