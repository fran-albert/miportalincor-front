import { useUsers } from "@/hooks/User/useUsers";
import { UsersTable } from "@/components/User/Table/table";
import { Helmet } from "react-helmet-async";
import useUserRole from "@/hooks/useRoles";

const UsersComponent = () => {
  const { users, isFetching, error, refetch } = useUsers();
  const { session } = useUserRole();
  const currentUserId = Number(session?.id);

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
        isFetching={isFetching}
        onRefetch={refetch}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default UsersComponent;
