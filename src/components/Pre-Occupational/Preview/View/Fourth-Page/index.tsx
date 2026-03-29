import {
  Circulatorio,
  Neurologico,
  Respiratorio,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoHtml from "./Neurologico";
import RespiratorioHtml from "../Third-Page/Respiratorio";
import CirculatorioHtml from "../Third-Page/Circulatorio";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";
import PreviewPageShell from "../PageShell";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  neurologico: Neurologico;
  respiratorio: Respiratorio;
  circulatorio: Circulatorio;
  doctorData: DoctorSignatures;
  medicalEvaluationType: string;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}
const FourthPageHTML = ({
  neurologico,
  respiratorio,
  circulatorio,
  doctorData,
  medicalEvaluationType,
  brandingConfig,
  pageNumber = 4,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasRespiratorio = hasSectionData(respiratorio);
  const hasCirculatorio = hasSectionData(circulatorio);
  const hasNeurologico = hasSectionData(neurologico);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasRespiratorio && !hasCirculatorio && !hasNeurologico) {
    return null;
  }

  return (
    <PreviewPageShell
      pageNumber={pageNumber}
      examType="Examen Clínico"
      evaluationType={medicalEvaluationType}
      doctorData={doctorData}
      brandingConfig={brandingConfig}
      institutionalSigner={getInstitutionalSignerForSection(
        "clinical",
        brandingConfig,
        medicalEvaluationType
      )}
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
      <RespiratorioHtml data={respiratorio} />
      <CirculatorioHtml data={circulatorio} />
      <NeurologicoHtml data={neurologico} />
    </PreviewPageShell>
  );
};

export default FourthPageHTML;
