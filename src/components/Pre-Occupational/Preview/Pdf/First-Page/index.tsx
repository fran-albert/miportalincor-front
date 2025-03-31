import { Page, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import ExamResultsPdf from "./Exams-Results";
import ConclusionPdf from "./Conclusion";
import {
  ConclusionOptions,
  ExamResults,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import PdfFooter from "../Footer";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  conclusionOptions?: ConclusionOptions;
  medicalEvaluationType: string;
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
  conclusionOptions,
  medicalEvaluationType,
}: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType={medicalEvaluationType}
    />
    <CollaboratorInformationPdf
      collaborator={collaborator}
      companyData={collaborator.company}
    />
    <ExamResultsPdf examResults={examResults} />
    <ConclusionPdf
      conclusion={conclusion}
      conclusionOptions={conclusionOptions}
    />
    <PdfFooter
      pageNumber={1}
      doctorName="Dr. Juan Pérez"
      doctorLicense="12345"
      signatureUrl="https://imgs.search.brave.com/KgtC37nJ8FZd7vidGl8lipdmUm1Ll4Lmi2NlJDafTQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2ExL0pvcyVDMyVB/OV9NaWd1ZWxfSW5z/dWx6YV9maXJtYS5w/bmc"
    />
  </Page>
);

export default FirstPagePdfDocument;
