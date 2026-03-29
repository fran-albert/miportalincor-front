import { Page, StyleSheet, View } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import ExamResultsPdf from "./Exams-Results";
import ConclusionPdf from "./Conclusion";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import FooterPdfConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { pdfFooterLayout } from "../shared";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  recomendaciones: string;
  medicalEvaluationType: string;
  antecedentes: DataValue[] | undefined;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  pageNumber?: number;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 8,
    paddingHorizontal: pdfFooterLayout.horizontalInset,
    paddingBottom: pdfFooterLayout.reservedSpace,
    fontSize: 8.5,
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

const FirstPagePdfDocument = ({
  collaborator,
  examResults,
  conclusion,
  recomendaciones,
  antecedentes,
  medicalEvaluationType,
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
    <Page size="A4" style={styles.page}>
      <HeaderPreviewPdf
        evaluationType={"Examen"}
        examType={medicalEvaluationType}
        brandingConfig={brandingConfig}
      />
      <View style={styles.content}>
        <View style={styles.sectionWrapper}>
          <CollaboratorInformationPdf
            collaborator={collaborator}
            companyData={collaborator.company}
            antecedentes={antecedentes}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <ExamResultsPdf examResults={examResults} />
        </View>
        <View style={styles.sectionWrapper}>
          <ConclusionPdf
            conclusion={conclusion}
            recomendaciones={recomendaciones}
          />
        </View>
      </View>
      <FooterPdfConditional
        pageNumber={pageNumber}
        fixed
        containerStyle={styles.footer}
        useCustom={usesExamDoctorSignature(
          "cover",
          brandingConfig,
          medicalEvaluationType
        )}
        presentationMode={getPresentationModeForSection(
          "cover",
          brandingConfig,
          medicalEvaluationType
        )}
        institutionalSigner={institutionalSigner}
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

export default FirstPagePdfDocument;
