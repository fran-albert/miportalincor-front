import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsCancellations,
  AppointmentsAnalyticsFilters,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getAppointmentsAnalyticsCancellations = async (
  filters: AppointmentsAnalyticsFilters
): Promise<AppointmentsAnalyticsCancellations> => {
  const { data } = await apiTurnos.get<AppointmentsAnalyticsCancellations>(
    `analytics/appointments/cancellations?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
