import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ExamResultsHtml from "./Exams-Results";
import ConclusionHtml from "./Conclusion";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import FooterHtmlConditional from "../Footer";

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
    <FooterHtmlConditional pageNumber={1} />
  </>
);

export default FirstPageHTML;
