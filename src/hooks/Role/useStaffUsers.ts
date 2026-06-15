import {
  getStaffUsers,
  GetStaffUsersParams,
  PaginatedStaffUsers,
} from "@/api/Role/get-staff-users.action";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useStaffUsers = (params: GetStaffUsersParams = {}) => {
  const { page = 1, limit = 20, search = "" } = params;

  const { isLoading, isError, error, data, isFetching, refetch } =
    useQuery<PaginatedStaffUsers>({
      queryKey: ["staff-users", { page, limit, search }],
      queryFn: () => getStaffUsers({ page, limit, search }),
      // Mantiene la pagina anterior visible mientras carga la nueva (sin
      // parpadeo ni "recarga" al cambiar de pagina o buscar).
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    });

  return {
    staffUsers: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};
