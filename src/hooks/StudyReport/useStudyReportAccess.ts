import { useQuery } from "@tanstack/react-query";
import { getStudyReportAccess } from "@/api/StudyReport/study-report.actions";

export const studyReportAccessKeys = {
  access: (doctorUserId: string) => ["study-reports", "access", doctorUserId] as const,
};

interface UseStudyReportAccessOptions {
  doctorUserId?: string;
  enabled?: boolean;
}

export const useStudyReportAccess = ({
  doctorUserId,
  enabled = true,
}: UseStudyReportAccessOptions = {}) =>
  useQuery({
    queryKey: studyReportAccessKeys.access(doctorUserId ?? "anonymous"),
    queryFn: getStudyReportAccess,
    enabled: enabled && Boolean(doctorUserId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
