import { Page, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import ExamResultsPdf from "./Exams-Results";
import ConclusionPdf from "./Conclusion";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import FooterPdfConditional from "../Footer";

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
    <FooterPdfConditional pageNumber={1} />
  </Page>
);

export default FirstPagePdfDocument;
