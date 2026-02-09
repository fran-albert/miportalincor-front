import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getDoctorPendingPaginated } from "@/api/Prescription-Request/get-doctor-pending-paginated.action";
import { getDoctorHistoryPaginated } from "@/api/Prescription-Request/get-doctor-history-paginated.action";
import { PaginatedPrescriptionRequests } from "@/types/Prescription-Request/Prescription-Request";

interface UseSearchDoctorRequestsOptions {
  initialSearch?: string;
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
  debounceMs?: number;
}

const useSearchDoctorRequests = (
  queryKeyPrefix: string,
  fetchFn: (params: {
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<PaginatedPrescriptionRequests>,
  options: UseSearchDoctorRequestsOptions = {}
) => {
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
    queryKey: [queryKeyPrefix, debouncedSearch, page, limit],
    queryFn: () =>
      fetchFn({
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
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
    requests: data?.data || [],
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
    refetch,
  };
};

export const useSearchDoctorPendingRequests = (
  options: UseSearchDoctorRequestsOptions = {}
) => {
  return useSearchDoctorRequests(
    "doctor-pending-search",
    getDoctorPendingPaginated,
    options
  );
};

export const useSearchDoctorHistoryRequests = (
  options: UseSearchDoctorRequestsOptions = {}
) => {
  return useSearchDoctorRequests(
    "doctor-history-search",
    getDoctorHistoryPaginated,
    options
  );
};
