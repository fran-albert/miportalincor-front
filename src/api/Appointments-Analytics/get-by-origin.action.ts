import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsFilters,
  AppointmentsAnalyticsOriginItem,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getAppointmentsAnalyticsByOrigin = async (
  filters: AppointmentsAnalyticsFilters
): Promise<AppointmentsAnalyticsOriginItem[]> => {
  const { data } = await apiTurnos.get<AppointmentsAnalyticsOriginItem[]>(
    `analytics/appointments/by-origin?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
