import {
  Gastrointestinal,
  Genitourinario,
  Osteoarticular,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import GastrointestinalHtml from "../Fourth-Page/Gastrointestinal";
import GenitourinarioHtml from "../Fourth-Page/Genitourinario";
import OsteoarticularHtml from "../Fourth-Page/Osteoarticular";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";
import {
  ReportVisibilityMode,
  resolveReportVisibility,
} from "@/common/helpers/report-visibility";
import PreviewPageShell from "../PageShell";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  collaboratorGender?: string;
  genitourinaryGynObVisibilityMode?: ReportVisibilityMode;
  gastrointestinal: Gastrointestinal;
  genitourinario: Genitourinario;
  osteoarticular: Osteoarticular;
  doctorData: DoctorSignatures;
  medicalEvaluationType: string;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}
const FifthPageHTML = ({
  collaboratorGender,
  genitourinaryGynObVisibilityMode,
  gastrointestinal,
  genitourinario,
  osteoarticular,
  doctorData,
  medicalEvaluationType,
  brandingConfig,
  pageNumber = 5,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasGastrointestinal = hasSectionData(gastrointestinal);
  const hasOsteoarticular = hasSectionData(osteoarticular);
  const hasGinecoData =
    Boolean(genitourinario?.fum?.trim()) ||
    Boolean(genitourinario?.partos?.trim()) ||
    Boolean(genitourinario?.cesarea?.trim()) ||
    Boolean(genitourinario?.embarazos?.trim());
  const gynObVisibility = resolveReportVisibility({
    sectionKey: "genitourinary_gyn_ob",
    visibilityMode: genitourinaryGynObVisibilityMode,
    collaboratorGender,
    hasData: hasGinecoData,
  });
  const hasGenitourinarioCoreData =
    genitourinario?.sinAlteraciones !== undefined ||
    genitourinario?.varicocele !== undefined ||
    Boolean(genitourinario?.observaciones?.trim()) ||
    Boolean(genitourinario?.varicoceleObs?.trim());
  const hasVisibleGenitourinario =
    hasGenitourinarioCoreData ||
    gynObVisibility.resolvedVisibility === "visible";

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasGastrointestinal && !hasVisibleGenitourinario && !hasOsteoarticular) {
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
      <GastrointestinalHtml data={gastrointestinal} />
      {hasVisibleGenitourinario && (
        <GenitourinarioHtml
          data={genitourinario}
          showGinecoData={gynObVisibility.resolvedVisibility === "visible"}
        />
      )}
      <OsteoarticularHtml data={osteoarticular} />
    </PreviewPageShell>
  );
};

export default FifthPageHTML;
