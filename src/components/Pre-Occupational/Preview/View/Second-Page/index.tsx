import { Collaborator } from "@/types/Collaborator/Collaborator";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityHtml from "./Visual";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { PhysicalEvaluation } from "@/common/helpers/maps";
import PreviewPageShell from "../PageShell";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
interface Props {
  collaborator: Collaborator;
  talla: string;
  peso: string;
  imc: string;
  medicalEvaluationType: string;
  perimetroAbdominal: string;
  aspectoGeneral: string;
  tiempoLibre: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  presionSistolica: string;
  presionDiastolica: string;
  examenFisico: PhysicalEvaluation;
  antecedentes: DataValue[];
  visualWithout: { right: string; left: string };
  visualWith?: { right?: string; left?: string };
  visualChromatic: "normal" | "anormal";
  visualNotes?: string;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}

const SecondPageHTML = ({
  collaborator,
  peso,
  talla,
  imc,
  medicalEvaluationType,
  aspectoGeneral,
  antecedentes,
  visualWithout,
  visualWith,
  visualChromatic,
  doctorData,
  visualNotes,
  brandingConfig,
  pageNumber = 2,
}: Props) => {
  const institutionalSigner = getInstitutionalSignerForSection(
    "clinical",
    brandingConfig,
    medicalEvaluationType
  );

  return (
    <PreviewPageShell
      pageNumber={pageNumber}
      examType="Examen Clínico"
      evaluationType={medicalEvaluationType}
      doctorData={doctorData}
      brandingConfig={brandingConfig}
      institutionalSigner={institutionalSigner}
      presentationMode={getPresentationModeForSection(
        "clinical",
        brandingConfig,
        medicalEvaluationType
      )}
      useCustomSignature={usesExamDoctorSignature(
        "clinical",
        brandingConfig,
        medicalEvaluationType
      )}
    >
      <CollaboratorInformationHtml
        collaborator={collaborator}
        companyData={collaborator.company}
        antecedentes={antecedentes}
        showAntecedentes={false}
        compactWorkerOnly
      />
      <ClinicalEvaluationHtml
        talla={talla}
        peso={peso}
        imc={imc}
        aspectoGeneral={aspectoGeneral}
      />
      <VisualAcuityHtml
        withoutCorrection={visualWithout}
        withCorrection={visualWith}
        chromaticVision={visualChromatic}
        notes={visualNotes}
      />
    </PreviewPageShell>
  );
};

export default SecondPageHTML;
