import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getStudyInbox } from "@/api/StudyInbox/get-study-inbox.action";
import { INBOX_REFRESH_INTERVAL_MS } from "@/hooks/StudyInbox/useStudyInboxCounts";
import { StudyInboxStatus } from "@/types/StudyInbox/StudyInbox.types";

interface UseStudyInboxOptions {
  status?: StudyInboxStatus;
  initialLimit?: number;
  debounceMs?: number;
}

export const useStudyInbox = (options: UseStudyInboxOptions = {}) => {
  const { status, initialLimit = 10, debounceMs = 300 } = options;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Reiniciar a la primera página al cambiar de estado o búsqueda
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["study-inbox", status, debouncedSearch, page, initialLimit],
    queryFn: () =>
      getStudyInbox({ status, search: debouncedSearch, page, limit: initialLimit }),
    staleTime: 1000 * 15,
    // La lista visible se refresca sola junto con los conteos de las pestañas.
    refetchInterval: INBOX_REFRESH_INTERVAL_MS,
  });

  const nextPage = () => {
    if (data?.hasNextPage) setPage((old) => old + 1);
  };

  const prevPage = () => {
    if (data?.hasPreviousPage) setPage((old) => Math.max(old - 1, 1));
  };

  return {
    items: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError,
    error,
    isFetching,
    search,
    setSearch,
    nextPage,
    prevPage,
  };
};
