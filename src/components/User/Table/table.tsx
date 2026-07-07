import { getColumns } from "./columns";
import { User } from "@/types/User/User";
import { UserStatusFilter } from "@/api/User/get-all-users.action";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  search: string;
  status: UserStatusFilter;
  isFetching?: boolean;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: UserStatusFilter) => void;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  currentUserId: number;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  total,
  page,
  limit,
  search,
  status,
  isFetching,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onRefetch,
  currentUserId,
}) => {
  const userColumns = getColumns(onRefetch, currentUserId);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Usuarios del Sistema" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Usuarios del Sistema"
        description="Gestiona el acceso y permisos de los usuarios del sistema"
        icon={<Users className="h-6 w-6" />}
        badge={total}
      />
      <Tabs
        value={status}
        onValueChange={(value) => onStatusChange(value as UserStatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={userColumns}
          data={users}
          searchPlaceholder="Buscar por nombre, apellido, DNI o email..."
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
