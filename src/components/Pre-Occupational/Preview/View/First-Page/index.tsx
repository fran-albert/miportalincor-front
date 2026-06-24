import { Collaborator } from "@/types/Collaborator/Collaborator";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ExamResultsHtml from "./Exams-Results";
import ConclusionHtml from "./Conclusion";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import PreviewPageShell from "../PageShell";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  medicalEvaluationType: string;
  antecedentes: DataValue[];
  recomendaciones: string;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}

const FirstPageHTML = ({
  collaborator,
  examResults,
  medicalEvaluationType,
  conclusion,
  recomendaciones,
  antecedentes,
  doctorData,
  brandingConfig,
  pageNumber = 1,
}: Props) => {
  const institutionalSigner = getInstitutionalSignerForSection(
    "cover",
    brandingConfig,
    medicalEvaluationType
  );

  return (
    <PreviewPageShell
      pageNumber={pageNumber}
      examType={medicalEvaluationType}
      evaluationType="Examen"
      doctorData={doctorData}
      brandingConfig={brandingConfig}
      institutionalSigner={institutionalSigner}
      presentationMode={getPresentationModeForSection(
        "cover",
        brandingConfig,
        medicalEvaluationType
      )}
      useCustomSignature={usesExamDoctorSignature(
        "cover",
        brandingConfig,
        medicalEvaluationType
      )}
    >
      <CollaboratorInformationHtml
        collaborator={collaborator}
        companyData={collaborator.company}
        antecedentes={antecedentes}
      />
      <ExamResultsHtml examResults={examResults} />
      <ConclusionHtml
        conclusion={conclusion}
        recomendaciones={recomendaciones}
      />
    </PreviewPageShell>
  );
};

export default FirstPageHTML;
