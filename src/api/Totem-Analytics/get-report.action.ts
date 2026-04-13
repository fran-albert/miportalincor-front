import { apiTurnos } from "@/services/axiosConfig";
import {
  TotemAnalyticsFilters,
  TotemAnalyticsReport,
} from "@/types/Totem-Analytics/TotemAnalytics";

const buildTotemAnalyticsParams = (filters: TotemAnalyticsFilters) => {
  const params = new URLSearchParams();
  params.set("dateFrom", filters.dateFrom);
  params.set("dateTo", filters.dateTo);
  return params;
};

export const getTotemAnalyticsReport = async (
  filters: TotemAnalyticsFilters
): Promise<TotemAnalyticsReport> => {
  const { data } = await apiTurnos.get<TotemAnalyticsReport>(
    `analytics/totem/report?${buildTotemAnalyticsParams(filters).toString()}`
  );

  return data;
};
