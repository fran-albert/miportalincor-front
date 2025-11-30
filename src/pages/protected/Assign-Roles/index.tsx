import { useStaffUsers } from "@/hooks/Role/useStaffUsers";
import { StaffUsersTable } from "@/components/RoleManagement/StaffUsersTable";
import { Helmet } from "react-helmet-async";

const AssignRolesPage = () => {
  const { staffUsers, isFetching, error, refetch } = useStaffUsers();

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
        isFetching={isFetching}
        onRefetch={refetch}
      />
    </>
  );
};

export default AssignRolesPage;
