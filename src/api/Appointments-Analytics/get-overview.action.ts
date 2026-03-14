import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsFilters,
  AppointmentsAnalyticsOverview,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getAppointmentsAnalyticsOverview = async (
  filters: AppointmentsAnalyticsFilters
): Promise<AppointmentsAnalyticsOverview> => {
  const { data } = await apiTurnos.get<AppointmentsAnalyticsOverview>(
    `analytics/appointments/overview?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
