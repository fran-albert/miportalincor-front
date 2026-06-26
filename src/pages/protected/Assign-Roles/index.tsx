import { useState } from "react";
import { useStaffUsers } from "@/hooks/Role/useStaffUsers";
import { StaffUsersTable } from "@/components/RoleManagement/StaffUsersTable";
import { Helmet } from "react-helmet-async";

const PAGE_SIZE = 20;

const AssignRolesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { staffUsers, total, isFetching, error } = useStaffUsers({
    page,
    limit: PAGE_SIZE,
    search,
  });

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1); // al buscar, volver a la primera pagina
  };

  return (
    <>
      <Helmet>
        <title>Asignar Roles</title>
      </Helmet>
      {error && (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Hubo un error al cargar el personal.
          </div>
        </div>
      )}
      <StaffUsersTable
        users={staffUsers}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        isFetching={isFetching}
        search={search}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
      />
    </>
  );
};

export default AssignRolesPage;
