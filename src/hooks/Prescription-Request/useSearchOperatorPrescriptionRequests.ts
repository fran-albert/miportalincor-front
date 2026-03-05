import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getOperatorPendingPaginated } from "@/api/Prescription-Request/get-operator-pending-paginated.action";
import { getOperatorHistoryPaginated } from "@/api/Prescription-Request/get-operator-history-paginated.action";
import {
  PaginatedPrescriptionRequests,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";

interface UseSearchOperatorRequestsOptions {
  initialSearch?: string;
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
  debounceMs?: number;
}

const useSearchOperatorRequests = (
  queryKeyPrefix: string,
  fetchFn: (params: {
    search?: string;
    page?: number;
    limit?: number;
    status?: PrescriptionRequestStatus;
  }) => Promise<PaginatedPrescriptionRequests>,
  options: UseSearchOperatorRequestsOptions = {}
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
  const [statusFilter, setStatusFilter] = useState<
    PrescriptionRequestStatus | undefined
  >(undefined);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Reset to page 1 when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
    queryKey: [queryKeyPrefix, debouncedSearch, page, limit, statusFilter],
    queryFn: () =>
      fetchFn({
        search: debouncedSearch || undefined,
        page,
        limit,
        status: statusFilter,
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
    statusFilter,
    setStatusFilter,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
};

export const useSearchOperatorPendingRequests = (
  options: UseSearchOperatorRequestsOptions = {}
) => {
  return useSearchOperatorRequests(
    "operator-pending-search",
    getOperatorPendingPaginated,
    options
  );
};

export const useSearchOperatorHistoryRequests = (
  options: UseSearchOperatorRequestsOptions = {}
) => {
  return useSearchOperatorRequests(
    "operator-history-search",
    getOperatorHistoryPaginated,
    options
  );
};
