import { apiIncorHC } from "@/services/axiosConfig";
import {
  TotemAnalyticsFilters,
  TotemPatientRegistrationStats,
} from "@/types/Totem-Analytics/TotemAnalytics";

const buildPatientRegistrationParams = (filters: TotemAnalyticsFilters) => {
  const params = new URLSearchParams();
  params.set("dateFrom", filters.dateFrom);
  params.set("dateTo", filters.dateTo);
  return params;
};

export const getTotemPatientRegistrationStats = async (
  filters: TotemAnalyticsFilters
): Promise<TotemPatientRegistrationStats> => {
  const { data } = await apiIncorHC.get<TotemPatientRegistrationStats>(
    `/statistics/patient-registrations?${buildPatientRegistrationParams(filters).toString()}`
  );

  return data;
};
