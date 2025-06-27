import { Page, StyleSheet, View } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import PdfFooter from "../Footer";
import ClinicalEvaluationPdf from "./Clinical-Evaluation";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityPdf from "./Visual";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  collaborator: Collaborator;
  talla: string;
  peso: string;
  imc: string;
  antecedentes: DataValue[] | undefined;
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
      <PdfFooter
        pageNumber={2}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </View>
  </Page>
);

export default SecondPagePdfDocument;
