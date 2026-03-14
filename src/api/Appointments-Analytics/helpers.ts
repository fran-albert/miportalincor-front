import { AppointmentsAnalyticsFilters } from "@/types/Appointments-Analytics/AppointmentsAnalytics";

export const buildAnalyticsParams = (filters: AppointmentsAnalyticsFilters) => {
  const params = new URLSearchParams();

  params.set("dateFrom", filters.dateFrom);
  params.set("dateTo", filters.dateTo);

  if (filters.doctorId) {
    params.set("doctorId", String(filters.doctorId));
  }

  if (filters.consultationTypeId) {
    params.set("consultationTypeId", String(filters.consultationTypeId));
  }

  if (filters.origin) {
    params.set("origin", filters.origin);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  return params;
};
