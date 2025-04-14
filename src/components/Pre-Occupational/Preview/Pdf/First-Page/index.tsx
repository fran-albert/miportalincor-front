import { Page, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import ExamResultsPdf from "./Exams-Results";
import ConclusionPdf from "./Conclusion";
import { ExamResults } from "@/store/Pre-Occupational/preOccupationalSlice";
import PdfFooter from "../Footer";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  recomendaciones: string;
  medicalEvaluationType: string;
  antecedentes: DataValue[] | undefined;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    flexDirection: "column",
    justifyContent: "space-between",
  },
});

const FirstPagePdfDocument = ({
  collaborator,
  examResults,
  conclusion,
  recomendaciones,
  antecedentes,
  medicalEvaluationType,
}: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Examen"}
      examType={medicalEvaluationType}
    />
    <CollaboratorInformationPdf
      collaborator={collaborator}
      companyData={collaborator.company}
      antecedentes={antecedentes}
    />
    <ExamResultsPdf examResults={examResults} />
    <ConclusionPdf conclusion={conclusion} recomendaciones={recomendaciones} />
    <PdfFooter
      pageNumber={1}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default FirstPagePdfDocument;
