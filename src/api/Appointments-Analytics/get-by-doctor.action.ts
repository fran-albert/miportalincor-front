import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentsAnalyticsDoctorItem,
  AppointmentsAnalyticsFilters,
} from "@/types/Appointments-Analytics/AppointmentsAnalytics";
import { buildAnalyticsParams } from "./helpers";

export const getAppointmentsAnalyticsByDoctor = async (
  filters: AppointmentsAnalyticsFilters
): Promise<AppointmentsAnalyticsDoctorItem[]> => {
  const { data } = await apiTurnos.get<AppointmentsAnalyticsDoctorItem[]>(
    `analytics/appointments/by-doctor?${buildAnalyticsParams(filters).toString()}`
  );
  return data;
};
