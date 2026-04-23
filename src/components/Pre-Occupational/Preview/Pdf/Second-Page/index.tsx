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

interface Props {
  collaborator: Collaborator;
  talla: string;
  peso: string;
  imc: string;
  antecedentes: DataValue[] | undefined;
  doctorData: DoctorSignatures;
  aspectoGeneral: "Bueno" | "Regular" | "Malo";
  data: IMedicalEvaluation;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 60,
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
    bottom: 10,
    left: 12,
    right: 12,
  },
});

const SecondPagePdfDocument = ({
  collaborator,
  talla,
  peso,
  imc,
  aspectoGeneral,
  doctorData,
  antecedentes,
  data,
}: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />

    <View style={styles.content}>
      <View style={styles.sectionWrapper}>
        <CollaboratorInformationPdf
          antecedentes={antecedentes}
          collaborator={collaborator}
          companyData={collaborator.company}
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
    <View style={styles.footer}>
      <FooterPdfConditional
        pageNumber={2}
        useCustom={true}
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        signatureUrl={doctorData.signatureDataUrl}
        sealUrl={doctorData.sealDataUrl}
      />
    </View>
  </Page>
);

export default SecondPagePdfDocument;
