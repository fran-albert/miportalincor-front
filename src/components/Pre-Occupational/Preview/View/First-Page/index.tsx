import { Collaborator } from "@/types/Collaborator/Collaborator";
import { ExamResults } from "@/store/Pre-Occupational/preOccupationalSlice";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ExamResultsHtml from "./Exams-Results";
import ConclusionHtml from "./Conclusion";
import FooterHtml from "../Footer";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  collaborator: Collaborator;
  examResults: ExamResults;
  conclusion: string;
  medicalEvaluationType: string;
  antecedentes: DataValue[];
  recomendaciones: string;
}

const FirstPageHTML = ({
  collaborator,
  examResults,
  medicalEvaluationType,
  conclusion,
  recomendaciones,
  antecedentes,
}: Props) => (
  <>
    <HeaderPreviewHtml
      examType="Examen"
      evaluationType={medicalEvaluationType}
    />
    <CollaboratorInformationHtml
      collaborator={collaborator}
      companyData={collaborator.company}
      antecedentes={antecedentes}
    />
    <ExamResultsHtml examResults={examResults} />
    <ConclusionHtml conclusion={conclusion} recomendaciones={recomendaciones} />
    <FooterHtml
      pageNumber={1}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default FirstPageHTML;
