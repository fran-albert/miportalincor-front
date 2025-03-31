import { Collaborator } from "@/types/Collaborator/Collaborator";
import {
  ConclusionOptions,
  ExamResults,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ExamResultsHtml from "./Exams-Results";
import ConclusionHtml from "./Conclusion";
import FooterHtml from "../Footer";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  medicalEvaluationType: string;
  conclusionOptions?: ConclusionOptions;
}

const FirstPageHTML = ({
  collaborator,
  examResults,
  medicalEvaluationType,
  conclusion,
  conclusionOptions,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType={medicalEvaluationType} />
    <CollaboratorInformationHtml
      collaborator={collaborator}
      companyData={collaborator.company}
    />
    <ExamResultsHtml examResults={examResults} />
    <ConclusionHtml
      conclusion={conclusion}
      conclusionOptions={conclusionOptions}
    />
    <FooterHtml
      pageNumber={1}
      doctorName="Dr. Juan Pérez"
      doctorLicense="12345"
      signatureUrl="https://imgs.search.brave.com/KgtC37nJ8FZd7vidGl8lipdmUm1Ll4Lmi2NlJDafTQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2ExL0pvcyVDMyVB/OV9NaWd1ZWxfSW5z/dWx6YV9maXJtYS5w/bmc"
    />
  </>
);

export default FirstPageHTML;
