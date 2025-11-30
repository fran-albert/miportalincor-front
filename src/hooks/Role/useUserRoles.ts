import { getUserRoles } from "@/api/Role/get-user-roles.action";
import { assignRoleToUser } from "@/api/Role/assign-role.action";
import { removeRoleFromUser } from "@/api/Role/remove-role.action";
import { Role } from "@/api/Role/get-all-roles.action";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useUserRoles = (userId: string) => {
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: userRoles = [],
    isFetching,
    refetch
  } = useQuery<Role[]>({
    queryKey: ['user-roles', userId],
    queryFn: () => getUserRoles(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const assignRole = useMutation({
    mutationFn: (roleId: number) => assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
    },
  });

  const removeRole = useMutation({
    mutationFn: (roleId: number) => removeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
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
