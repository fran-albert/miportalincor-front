import { useQuery } from "@tanstack/react-query";
import {
  getPrescriptionReportSummary,
  getPrescriptionReportByDoctor,
  getPrescriptionReportWeeklyTrend,
} from "@/api/Prescription-Reports";
import type {
  PrescriptionReportSummary,
  PrescriptionReportByDoctor,
  PrescriptionReportWeeklyTrend,
} from "@/types/Prescription-Reports/Prescription-Reports";

export const prescriptionReportKeys = {
  all: ["prescriptionReports"] as const,
  summary: (from: string, to: string) =>
    [...prescriptionReportKeys.all, "summary", from, to] as const,
  byDoctor: (from: string, to: string) =>
    [...prescriptionReportKeys.all, "by-doctor", from, to] as const,
  weeklyTrend: (from: string, to: string) =>
    [...prescriptionReportKeys.all, "weekly-trend", from, to] as const,
};

export const usePrescriptionReportSummary = (from: string, to: string) => {
  return useQuery<PrescriptionReportSummary>({
    queryKey: prescriptionReportKeys.summary(from, to),
    queryFn: () => getPrescriptionReportSummary(from, to),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePrescriptionReportByDoctor = (from: string, to: string) => {
  return useQuery<PrescriptionReportByDoctor[]>({
    queryKey: prescriptionReportKeys.byDoctor(from, to),
    queryFn: () => getPrescriptionReportByDoctor(from, to),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePrescriptionReportWeeklyTrend = (from: string, to: string) => {
  return useQuery<PrescriptionReportWeeklyTrend[]>({
    queryKey: prescriptionReportKeys.weeklyTrend(from, to),
    queryFn: () => getPrescriptionReportWeeklyTrend(from, to),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
};
