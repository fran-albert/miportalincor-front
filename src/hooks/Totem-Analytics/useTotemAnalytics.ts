import { useQuery } from "@tanstack/react-query";
import { getTotemAnalyticsReport } from "@/api/Totem-Analytics";
import { TotemAnalyticsFilters } from "@/types/Totem-Analytics/TotemAnalytics";

const serializeFilters = (filters: TotemAnalyticsFilters) => ({
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
});

export const totemAnalyticsKeys = {
  all: ["totemAnalytics"] as const,
  report: (filters: TotemAnalyticsFilters) =>
    [...totemAnalyticsKeys.all, "report", serializeFilters(filters)] as const,
};

export const useTotemAnalyticsReport = (filters: TotemAnalyticsFilters) =>
  useQuery({
    queryKey: totemAnalyticsKeys.report(filters),
    queryFn: () => getTotemAnalyticsReport(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });
