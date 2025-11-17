import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { searchDoctors, SearchDoctorsParams } from "@/api/Doctor/search-doctors.action";

interface UseSearchDoctorsOptions {
  initialSearch?: string;
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
}

export const useSearchDoctors = (options: UseSearchDoctorsOptions = {}) => {
  const {
    initialSearch = "",
    initialPage = 1,
    initialLimit = 10,
    enabled = true,
  } = options;

  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const {
    isLoading,
    isError,
    error,
    data,
    isFetching,
  } = useQuery({
    queryKey: ["doctors-search", search, page, limit],
    queryFn: () => searchDoctors({ search, page, limit }),
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });

  const nextPage = () => {
    if (data?.hasNextPage) {
      setPage((old) => old + 1);
    }
  };

  const prevPage = () => {
    if (data?.hasPreviousPage) {
      setPage((old) => Math.max(old - 1, 1));
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  return {
    doctors: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
    error,
    isLoading,
    isError,
    isFetching,
    search,
    setSearch,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
  };
};
