import { Page, View, StyleSheet } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import BucodentalPdf from "./Bucodental";
import ToraxPdf from "./Torax";
import {
  IMedicalEvaluation,
  Piel,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import PielPdf from "./Piel";
import CabezaCuelloPdf from "./CabezaCuello";
import FooterPdfConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { pdfFooterLayout } from "../shared";

interface Props {
  data: IMedicalEvaluation;
  pielData: Piel;
  doctorData: DoctorSignatures;
  medicalEvaluationType: string;
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

const ThirdPagePdfDocument = ({
  data,
  pielData,
  doctorData,
  medicalEvaluationType,
  brandingConfig,
  pageNumber = 3,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasPiel = hasSectionData(pielData);
  const hasCabezaCuello = hasSectionData(data.cabezaCuello);
  const hasBucodental = hasSectionData(data.bucodental);
  const hasTorax = hasSectionData(data.torax);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasPiel && !hasCabezaCuello && !hasBucodental && !hasTorax) {
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
          <PielPdf
            normocoloreada={pielData?.normocoloreada}
            tatuajes={pielData?.tatuajes}
            observaciones={pielData?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <CabezaCuelloPdf
            sinAlteraciones={data.cabezaCuello?.sinAlteraciones}
            observaciones={data.cabezaCuello?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <BucodentalPdf
            sinAlteraciones={data.bucodental?.sinAlteraciones}
            caries={data.bucodental?.caries}
            faltanPiezas={data.bucodental?.faltanPiezas}
            observaciones={data.bucodental?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <ToraxPdf
            deformaciones={data.torax?.deformaciones}
            deformacionesObs={data.torax?.deformacionesObs}
            cicatrices={data.torax?.cicatrices}
            cicatricesObs={data.torax?.cicatricesObs}
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

export default ThirdPagePdfDocument;
