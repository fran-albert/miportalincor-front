import BucodentalHtml from "./Bucodental";
import ToraxHtml from "./Torax";
import { Piel, Torax } from "@/store/Pre-Occupational/preOccupationalSlice";
import CabezaCuelloHtml from "../Second-Page/CabezaCuello";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";
import PreviewPageShell from "../PageShell";
import PielHtml from "./Piel";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  bucodental: {
    sinAlteraciones?: boolean;
    caries?: boolean;
    faltanPiezas?: boolean;
    observaciones?: string;
  };
  torax: Torax;
  doctorData: DoctorSignatures;
  pielData: Piel;
  cabezaCuello: { sinAlteraciones?: boolean; observaciones?: string };
  medicalEvaluationType: string;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}
const ThirdPageHTML = ({
  bucodental,
  torax,
  doctorData,
  pielData,
  cabezaCuello,
  medicalEvaluationType,
  brandingConfig,
  pageNumber = 3,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasPiel = hasSectionData(pielData);
  const hasCabezaCuello = hasSectionData(cabezaCuello);
  const hasBucodental = hasSectionData(bucodental);
  const hasTorax = hasSectionData(torax);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasPiel && !hasCabezaCuello && !hasBucodental && !hasTorax) {
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
      <PielHtml data={pielData} />
      <CabezaCuelloHtml data={cabezaCuello} />
      <BucodentalHtml data={bucodental} />
      <ToraxHtml data={torax} />
    </PreviewPageShell>
  );
};

export default ThirdPageHTML;
