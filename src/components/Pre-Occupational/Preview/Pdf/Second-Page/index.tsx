import { Page, StyleSheet, View } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import ClinicalEvaluationPdf from "./Clinical-Evaluation";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityPdf from "./Visual";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
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
  talla: string;
  peso: string;
  imc: string;
  medicalEvaluationType: string;
  antecedentes: DataValue[] | undefined;
  doctorData: DoctorSignatures;
  aspectoGeneral: "Bueno" | "Regular" | "Malo";
  data: IMedicalEvaluation;
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

const SecondPagePdfDocument = ({
  collaborator,
  talla,
  peso,
  imc,
  medicalEvaluationType,
  aspectoGeneral,
  doctorData,
  antecedentes,
  data,
  brandingConfig,
  pageNumber = 2,
}: Props) => {
  const institutionalSigner = getInstitutionalSignerForSection(
    "clinical",
    brandingConfig,
    medicalEvaluationType
  );

  return (
    <Page size="A4" style={styles.page}>
      <HeaderPreviewPdf
        evaluationType={medicalEvaluationType}
        examType="Examen Clínico"
        brandingConfig={brandingConfig}
      />

      <View style={styles.content}>
        <View style={styles.sectionWrapper}>
          <CollaboratorInformationPdf
            antecedentes={antecedentes}
            collaborator={collaborator}
            companyData={collaborator.company}
            showAntecedentes={false}
            compactWorkerOnly
          />
        </View>
        <View style={styles.sectionWrapper}>
          <ClinicalEvaluationPdf
            talla={talla}
            peso={peso}
            imc={imc}
            aspectoGeneral={aspectoGeneral}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <VisualAcuityPdf
            withCorrection={data.agudezaCc}
            chromaticVision={data.visionCromatica!}
            withoutCorrection={data.agudezaSc}
            notes={data.notasVision}
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

export default SecondPagePdfDocument;
