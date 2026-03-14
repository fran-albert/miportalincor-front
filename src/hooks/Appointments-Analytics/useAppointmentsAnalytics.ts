import { useQuery } from "@tanstack/react-query";
import {
  getAppointmentsAnalyticsByConsultationType,
  getAppointmentsAnalyticsByDoctor,
  getAppointmentsAnalyticsByOrigin,
  getAppointmentsAnalyticsCancellations,
  getAppointmentsAnalyticsOverview,
  getOverturnAnalyticsOverview,
} from "@/api/Appointments-Analytics";
import { AppointmentsAnalyticsFilters } from "@/types/Appointments-Analytics/AppointmentsAnalytics";

const serializeFilters = (filters: AppointmentsAnalyticsFilters) => ({
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
  doctorId: filters.doctorId ?? null,
  consultationTypeId: filters.consultationTypeId ?? null,
  origin: filters.origin ?? null,
  status: filters.status ?? null,
});

export const appointmentsAnalyticsKeys = {
  all: ["appointmentsAnalytics"] as const,
  overview: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "overview", serializeFilters(filters)] as const,
  byType: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "by-type", serializeFilters(filters)] as const,
  byDoctor: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "by-doctor", serializeFilters(filters)] as const,
  byOrigin: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "by-origin", serializeFilters(filters)] as const,
  cancellations: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "cancellations", serializeFilters(filters)] as const,
  overturns: (filters: AppointmentsAnalyticsFilters) =>
    [...appointmentsAnalyticsKeys.all, "overturns", serializeFilters(filters)] as const,
};

export const useAppointmentsAnalyticsOverview = (filters: AppointmentsAnalyticsFilters) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.overview(filters),
    queryFn: () => getAppointmentsAnalyticsOverview(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });

export const useAppointmentsAnalyticsByConsultationType = (
  filters: AppointmentsAnalyticsFilters
) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.byType(filters),
    queryFn: () => getAppointmentsAnalyticsByConsultationType(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });

export const useAppointmentsAnalyticsByDoctor = (filters: AppointmentsAnalyticsFilters) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.byDoctor(filters),
    queryFn: () => getAppointmentsAnalyticsByDoctor(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });

export const useAppointmentsAnalyticsByOrigin = (filters: AppointmentsAnalyticsFilters) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.byOrigin(filters),
    queryFn: () => getAppointmentsAnalyticsByOrigin(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });

export const useAppointmentsAnalyticsCancellations = (filters: AppointmentsAnalyticsFilters) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.cancellations(filters),
    queryFn: () => getAppointmentsAnalyticsCancellations(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });

export const useOverturnAnalyticsOverview = (filters: AppointmentsAnalyticsFilters) =>
  useQuery({
    queryKey: appointmentsAnalyticsKeys.overturns(filters),
    queryFn: () => getOverturnAnalyticsOverview(filters),
    enabled: !!filters.dateFrom && !!filters.dateTo,
    staleTime: 5 * 60 * 1000,
  });
