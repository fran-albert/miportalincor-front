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
    <PhysicalEvaluationHtml examenFisico={examenFisico} section={1} />
    <FooterHtml
      pageNumber={2}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default SecondPageHTML;
