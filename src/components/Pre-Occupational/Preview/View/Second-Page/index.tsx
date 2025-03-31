import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import FooterHtml from "../Footer";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import PhysicalEvaluationHtml from "./Physical-Evaluationn";

interface Props {
  collaborator: Collaborator;
  talla?: string;
  peso?: string;
  imc?: string;
  examenFisico: any;
}

const SecondPageHTML = ({
  collaborator,
  peso,
  talla,
  imc,
  examenFisico,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <CollaboratorInformationHtml
      collaborator={collaborator}
      companyData={collaborator.company}
    />
    <ClinicalEvaluationHtml talla={talla} peso={peso} imc={imc} />
    <PhysicalEvaluationHtml examenFisico={examenFisico} section={1}/>
    <FooterHtml
      pageNumber={2}
      doctorName="Dr. Juan Pérez"
      doctorLicense="12345"
      signatureUrl="https://imgs.search.brave.com/KgtC37nJ8FZd7vidGl8lipdmUm1Ll4Lmi2NlJDafTQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2ExL0pvcyVDMyVB/OV9NaWd1ZWxfSW5z/dWx6YV9maXJtYS5w/bmc"
    />
  </>
);

export default SecondPageHTML;
