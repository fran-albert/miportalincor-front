import { Page, StyleSheet, View } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import OsteoarticularPdf from "./Osteoarticular";
import GenitourinarioPdf from "./Genitourinario";
import GastrointestinalPdf from "./Gastrointestinal";
import FooterPdfConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";
import {
  ReportVisibilityMode,
  resolveReportVisibility,
} from "@/common/helpers/report-visibility";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { pdfFooterLayout } from "../shared";

interface Props {
  collaboratorGender?: string;
  genitourinaryGynObVisibilityMode?: ReportVisibilityMode;
  medicalEvaluationType: string;
  data: IMedicalEvaluation;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 8,
    paddingHorizontal: pdfFooterLayout.horizontalInset,
    paddingBottom: pdfFooterLayout.reservedSpace,
    fontSize: 9,
    fontFamily: "Helvetica",
    position: "relative",
  },
  content: {
    flexDirection: "column",
  },
  sectionWrapper: {
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: pdfFooterLayout.bottomOffset,
    left: pdfFooterLayout.horizontalInset,
    right: pdfFooterLayout.horizontalInset,
  },
});

const FifthPagePdfDocument = ({
  collaboratorGender,
  genitourinaryGynObVisibilityMode,
  medicalEvaluationType,
  data,
  doctorData,
  brandingConfig,
  pageNumber = 5,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasGastrointestinal = hasSectionData(data.gastrointestinal);
  const hasOsteoarticular = hasSectionData(data.osteoarticular);
  const hasGinecoData =
    Boolean(data.genitourinario?.fum?.trim()) ||
    Boolean(data.genitourinario?.partos?.trim()) ||
    Boolean(data.genitourinario?.cesarea?.trim()) ||
    Boolean(data.genitourinario?.embarazos?.trim());
  const gynObVisibility = resolveReportVisibility({
    sectionKey: "genitourinary_gyn_ob",
    visibilityMode: genitourinaryGynObVisibilityMode,
    collaboratorGender,
    hasData: hasGinecoData,
  });
  const hasGenitourinarioCoreData =
    data.genitourinario?.sinAlteraciones !== undefined ||
    data.genitourinario?.varicocele !== undefined ||
    Boolean(data.genitourinario?.observaciones?.trim()) ||
    Boolean(data.genitourinario?.varicoceleObs?.trim());
  const hasVisibleGenitourinario =
    hasGenitourinarioCoreData ||
    gynObVisibility.resolvedVisibility === "visible";

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasGastrointestinal && !hasVisibleGenitourinario && !hasOsteoarticular) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <HeaderPreviewPdf
        evaluationType={medicalEvaluationType}
        examType="Examen Clínico"
        brandingConfig={brandingConfig}
      />
      <View style={styles.content}>
        <View style={styles.sectionWrapper}>
          <GastrointestinalPdf
            sinAlteraciones={data.gastrointestinal?.sinAlteraciones}
            observaciones={data.gastrointestinal?.observaciones}
            cicatrices={data.gastrointestinal?.cicatrices}
            cicatricesObs={data.gastrointestinal?.cicatricesObs}
            hernias={data.gastrointestinal?.hernias}
            herniasObs={data.gastrointestinal?.herniasObs}
            eventraciones={data.gastrointestinal?.eventraciones}
            eventracionesObs={data.gastrointestinal?.eventracionesObs}
            hemorroides={data.gastrointestinal?.hemorroides}
            hemorroidesObs={data.gastrointestinal?.hemorroidesObs}
          />
        </View>
        <View style={styles.sectionWrapper}>
          {hasVisibleGenitourinario && (
            <GenitourinarioPdf
              sinAlteraciones={data.genitourinario?.sinAlteraciones}
              observaciones={data.genitourinario?.observaciones}
              varicocele={data.genitourinario?.varicocele}
              varicoceleObs={data.genitourinario?.varicoceleObs}
              fum={data.genitourinario?.fum}
              partos={data.genitourinario?.partos}
              cesarea={data.genitourinario?.cesarea}
              embarazos={data.genitourinario?.embarazos}
              showGinecoData={gynObVisibility.resolvedVisibility === "visible"}
            />
          )}
        </View>
        <View style={styles.sectionWrapper}>
          <OsteoarticularPdf
            mmssSin={data.osteoarticular?.mmssSin}
            mmssObs={data.osteoarticular?.mmssObs}
            mmiiSin={data.osteoarticular?.mmiiSin}
            mmiiObs={data.osteoarticular?.mmiiObs}
            columnaSin={data.osteoarticular?.columnaSin}
            columnaObs={data.osteoarticular?.columnaObs}
            amputaciones={data.osteoarticular?.amputaciones}
            amputacionesObs={data.osteoarticular?.amputacionesObs}
          />
        </View>
      </View>

      <FooterPdfConditional
        pageNumber={pageNumber}
        fixed
        containerStyle={styles.footer}
        useCustom={usesExamDoctorSignature(
          "clinical",
          brandingConfig,
          medicalEvaluationType
        )}
        presentationMode={getPresentationModeForSection(
          "clinical",
          brandingConfig,
          medicalEvaluationType
        )}
        institutionalSigner={getInstitutionalSignerForSection(
          "clinical",
          brandingConfig,
          medicalEvaluationType
        )}
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        doctorStampText={doctorData.stampText}
        signatureUrl={doctorData.signatureDataUrl}
        sealUrl={doctorData.sealDataUrl}
      />
    </Page>
  );
};

export default FifthPagePdfDocument;
