import { useMedicalEvaluationReportVersions } from "@/hooks/Medical-Evaluation-Report-Version/useMedicalEvaluationReportVersions";
import { useGetStudyFileNameByEvaluationType } from "@/hooks/Study/useStudyFileNameByEvaluationType";
import { useGetSignedUrlByCollaboratorIdAndFileName } from "@/hooks/Study/useSignedUrlByCollaboratorAndFileName";

interface Props {
  auth?: boolean;
  collaboratorId: number;
  medicalEvaluationId: number;
}

export const useCurrentMedicalEvaluationReport = ({
  auth = true,
  collaboratorId,
  medicalEvaluationId,
}: Props) => {
  const reportVersionsQuery = useMedicalEvaluationReportVersions({
    auth,
    medicalEvaluationId,
  });

  const legacyReportQuery = useGetStudyFileNameByEvaluationType({
    auth,
    medicalEvaluationId,
  });

  const currentVersion = reportVersionsQuery.data?.currentVersion ?? null;
  const finalVersion = reportVersionsQuery.data?.finalVersion ?? null;
  const currentFileName =
    currentVersion?.fileName || legacyReportQuery.data?.fileName || "";
  const hasLegacyCurrentReport =
    !currentVersion && Boolean(legacyReportQuery.data?.fileName);

  const signedUrlQuery = useGetSignedUrlByCollaboratorIdAndFileName({
    auth: auth && Boolean(currentFileName),
    collaboratorId,
    fileName: currentFileName,
  });

  return {
    reportVersions: reportVersionsQuery.data,
    currentVersion,
    finalVersion,
    currentFileName,
    currentUrl: signedUrlQuery.data?.url,
    hasReport: Boolean(currentFileName),
    hasLegacyCurrentReport,
    isLoading:
      reportVersionsQuery.isLoading ||
      legacyReportQuery.isLoading ||
      signedUrlQuery.isLoading,
    isError:
      reportVersionsQuery.isError ||
      legacyReportQuery.isError ||
      signedUrlQuery.isError,
  };
};
