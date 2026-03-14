import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsFilters,
  AppointmentsAnalyticsGroupedItem,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getAppointmentsAnalyticsByConsultationType = async (
  filters: AppointmentsAnalyticsFilters
): Promise<AppointmentsAnalyticsGroupedItem[]> => {
  const { data } = await apiTurnos.get<AppointmentsAnalyticsGroupedItem[]>(
    `analytics/appointments/by-consultation-type?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
