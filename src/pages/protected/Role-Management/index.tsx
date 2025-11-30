import { useRoles } from "@/hooks/Role/useRoles";
import { RolesTable } from "@/components/RoleManagement/RolesTable";
import { Helmet } from "react-helmet-async";

const RoleManagementPage = () => {
  const { roles, isFetching, error, refetch } = useRoles();

  return (
    <>
      <Helmet>
        <title>Gestión de Roles</title>
      </Helmet>
      {error && (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Hubo un error al cargar los roles.
          </div>
        </div>
      )}
      <RolesTable
        roles={roles}
        isFetching={isFetching}
        onRefetch={refetch}
      />
    </>
  );
};

export default RoleManagementPage;
