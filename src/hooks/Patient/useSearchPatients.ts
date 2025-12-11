import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { searchPatients } from "@/api/Patient/search-patients.action";

interface UseSearchPatientsOptions {
  initialSearch?: string;
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
  debounceMs?: number;
}

export const useSearchPatients = (options: UseSearchPatientsOptions = {}) => {
  const {
    initialSearch = "",
    initialPage = 1,
    initialLimit = 10,
    enabled = true,
    debounceMs = 300,
  } = options;

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const {
    isLoading,
    isError,
    error,
    data,
    isFetching,
  } = useQuery({
    queryKey: ["patients-search", debouncedSearch, page, limit],
    queryFn: () => searchPatients({ search: debouncedSearch, page, limit }),
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled && debouncedSearch.length >= 2,
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
    patients: data?.data || [],
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
