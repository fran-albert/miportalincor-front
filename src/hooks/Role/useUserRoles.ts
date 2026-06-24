import { getUserRoles } from "@/api/Role/get-user-roles.action";
import { assignRoleToUser } from "@/api/Role/assign-role.action";
import { removeRoleFromUser } from "@/api/Role/remove-role.action";
import { Role } from "@/api/Role/get-all-roles.action";
import { PaginatedStaffUsers } from "@/api/Role/get-staff-users.action";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useUserRoles = (userId: string) => {
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: userRoles = [],
    isFetching,
    refetch,
  } = useQuery<Role[]>({
    queryKey: ["user-roles", userId],
    queryFn: () => getUserRoles(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  // Actualiza los roles del usuario en cache (sin refetch): en todas las paginas
  // cacheadas de la lista de staff y en la query de roles del usuario. Asi el
  // cambio se ve al instante y la pantalla no se recarga.
  const patchCaches = (mutate: (roles: Role[]) => Role[]) => {
    queryClient.setQueriesData<PaginatedStaffUsers>(
      { queryKey: ["staff-users"] },
      (old) =>
        old
          ? {
              ...old,
              data: old.data.map((u) =>
                u.id === userId ? { ...u, roles: mutate(u.roles) } : u
              ),
            }
          : old
    );
    queryClient.setQueryData<Role[]>(["user-roles", userId], (old = []) =>
      mutate(old)
    );
  };

  const assignRole = useMutation({
    mutationFn: (role: Role) => assignRoleToUser(userId, role.id),
    onSuccess: (_data, role) => {
      patchCaches((roles) =>
        roles.some((r) => r.id === role.id) ? roles : [...roles, role]
      );
    },
  });

  const removeRole = useMutation({
    mutationFn: (role: Role) => removeRoleFromUser(userId, role.id),
    onSuccess: (_data, role) => {
      patchCaches((roles) => roles.filter((r) => r.id !== role.id));
    },
  });

  return {
    userRoles,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
    assignRole,
    removeRole,
  };
};
