import { useState } from "react";
import { useUsers } from "@/hooks/User/useUsers";
import { UserStatusFilter } from "@/api/User/get-all-users.action";
import { UsersTable } from "@/components/User/Table/table";
import { Helmet } from "react-helmet-async";
import useUserRole from "@/hooks/useRoles";

const PAGE_SIZE = 20;

const UsersComponent = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatusFilter>("active");

  const { users, total, isFetching, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
    search,
    status,
  });
  const { session } = useUserRole();
  const currentUserId = Number(session?.id);

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleStatusChange = (newStatus: UserStatusFilter) => {
    setStatus(newStatus);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Usuarios del Sistema</title>
      </Helmet>
      {error && (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Hubo un error al cargar los usuarios.
          </div>
        </div>
      )}
      <UsersTable
        users={users}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        search={search}
        status={status}
        isFetching={isFetching}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPageChange={setPage}
        onRefetch={refetch}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default UsersComponent;
