import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { apiIncorHC } from "@/services/axiosConfig";
import type {
  AuditQueryParams,
  PaginatedAuditResponse,
  AuditLog,
} from "@/types/Audit/Audit";

interface UseAuditLogsOptions {
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
}

const fetchAuditLogs = async (
  params: AuditQueryParams
): Promise<PaginatedAuditResponse> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "" && value !== null
    )
  );

  const response = await apiIncorHC.get<PaginatedAuditResponse>("/audit-logs", {
    params: cleanParams,
  });

  return response.data;
};

const fetchAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await apiIncorHC.get<AuditLog>(`/audit-logs/${id}`);
  return response.data;
};

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { initialPage = 1, initialLimit = 20, enabled = true } = options;

  const [filters, setFilters] = useState<AuditQueryParams>({
    page: initialPage,
    limit: initialLimit,
    orderBy: "timestamp",
    orderDirection: "DESC",
  });

  const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 1000 * 30, // 30 seconds
    enabled,
  });

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (data && filters.page && filters.page < data.meta.totalPages) {
      setPage(filters.page + 1);
    }
  };

  const prevPage = () => {
    if (filters.page && filters.page > 1) {
      setPage(filters.page - 1);
    }
  };

  const updateFilters = useCallback((newFilters: Partial<AuditQueryParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: initialLimit,
      orderBy: "timestamp",
      orderDirection: "DESC",
    });
  }, [initialLimit]);

  return {
    logs: data?.data || [],
    total: data?.meta.total || 0,
    page: data?.meta.page || 1,
    limit: data?.meta.limit || initialLimit,
    totalPages: data?.meta.totalPages || 0,
    hasNextPage: (data?.meta.page || 0) < (data?.meta.totalPages || 0),
    hasPreviousPage: (data?.meta.page || 0) > 1,
    error,
    isLoading,
    isError,
    isFetching,
    filters,
    updateFilters,
    clearFilters,
    setPage,
    nextPage,
    prevPage,
    refetch,
  };
};

export const useAuditLogDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => (id ? fetchAuditLogById(id) : null),
    enabled: !!id,
  });
};

export const useExportAuditLogs = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportLogs = async (
    format: "csv" | "json",
    filters: AuditQueryParams
  ) => {
    setIsExporting(true);

    try {
      const cleanParams = Object.fromEntries(
        Object.entries({ ...filters, format }).filter(
          ([, value]) => value !== undefined && value !== "" && value !== null
        )
      );

      // Remove pagination params for export (backend handles max 1000)
      delete cleanParams.page;
      delete cleanParams.limit;

      const response = await apiIncorHC.get("/audit-logs/export", {
        params: cleanParams,
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportLogs,
    isExporting,
  };
};
