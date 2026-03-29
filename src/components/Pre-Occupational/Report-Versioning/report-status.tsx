/* eslint-disable react-refresh/only-export-components */
import { Badge, BadgeProps } from "@/components/ui/badge";
import { MedicalEvaluationReportVersion } from "@/types/Medical-Evaluation-Report-Version";

export function formatReportDate(date?: string): string {
  if (!date) return "-";

  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getReportStatus(
  version: MedicalEvaluationReportVersion | null,
  hasLegacyReport = false
): {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
} {
  if (!version && hasLegacyReport) {
    return { label: "Vigente", variant: "greenPrimary" };
  }

  if (!version) {
    return { label: "Sin informe", variant: "outline" };
  }

  if (version.outdatedByExamChanges) {
    return {
      label: "Editado, falta regenerar",
      variant: "warning",
    };
  }

  if (version.isFinal) {
    return { label: "Final entregada", variant: "success" };
  }

  return { label: "Vigente", variant: "greenPrimary" };
}

interface ReportStatusBadgeProps {
  version: MedicalEvaluationReportVersion | null;
  hasLegacyReport?: boolean;
  className?: string;
}

export function ReportStatusBadge({
  version,
  hasLegacyReport = false,
  className,
}: ReportStatusBadgeProps) {
  const status = getReportStatus(version, hasLegacyReport);

  return (
    <Badge variant={status.variant} className={className}>
      {status.label}
    </Badge>
  );
}
