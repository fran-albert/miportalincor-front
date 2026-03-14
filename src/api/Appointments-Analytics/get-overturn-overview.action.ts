import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsFilters,
  OverturnAnalyticsOverview,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getOverturnAnalyticsOverview = async (
  filters: AppointmentsAnalyticsFilters
): Promise<OverturnAnalyticsOverview> => {
  const { data } = await apiTurnos.get<OverturnAnalyticsOverview>(
    `analytics/overturns/overview?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
