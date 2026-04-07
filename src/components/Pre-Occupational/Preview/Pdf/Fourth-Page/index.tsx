import { Page, StyleSheet, View } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoPdf from "./Neurologico";
import CirculatorioPdf from "./Circulatorio";
import RespiratorioPdf from "./Respiratorio";
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
  doctorData: DoctorSignatures;
  medicalEvaluationType: string;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
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
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: pdfFooterLayout.bottomOffset,
    left: pdfFooterLayout.horizontalInset,
    right: pdfFooterLayout.horizontalInset,
  },
});

const FourthPagePdfDocument = ({
  data,
  doctorData,
  medicalEvaluationType,
  brandingConfig,
  pageNumber = 4,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasRespiratorio = hasSectionData(data.respiratorio);
  const hasCirculatorio = hasSectionData(data.circulatorio);
  const hasNeurologico = hasSectionData(data.neurologico);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasRespiratorio && !hasCirculatorio && !hasNeurologico) {
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
          <RespiratorioPdf
            frecuenciaRespiratoria={data.respiratorio?.frecuenciaRespiratoria}
            oximetria={data.respiratorio?.oximetria}
            sinAlteraciones={data.respiratorio?.sinAlteraciones}
            observaciones={data.respiratorio?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <CirculatorioPdf
            frecuenciaCardiaca={data.circulatorio?.frecuenciaCardiaca}
            presion={data.circulatorio?.presion}
            sinAlteraciones={data.circulatorio?.sinAlteraciones}
            observaciones={data.circulatorio?.observaciones}
            varices={data.circulatorio?.varices}
            varicesObs={data.circulatorio?.varicesObs}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <NeurologicoPdf
            sinAlteraciones={data.neurologico?.sinAlteraciones}
            observaciones={data.neurologico?.observaciones}
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

export default FourthPagePdfDocument;
