import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import FooterHtml from "../Footer";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityHtml from "./Visual";
interface Props {
  collaborator: Collaborator;
  talla: string;
  peso: string;
  imc: string;
  perimetroAbdominal: string;
  aspectoGeneral: string;
  tiempoLibre: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  presionSistolica: string;
  presionDiastolica: string;
  examenFisico: any;
  antecedentes: DataValue[];
  visualWithout: { right: string; left: string };
  visualWith?: { right?: string; left?: string };
  visualChromatic: "normal" | "anormal";
  visualNotes?: string;

}

const SecondPageHTML = ({
  collaborator,
  peso,
  talla,
  imc,
  aspectoGeneral,
  antecedentes,
  visualWithout,
  visualWith,
  visualChromatic,
  visualNotes,

}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <CollaboratorInformationHtml
      collaborator={collaborator}
      companyData={collaborator.company}
      antecedentes={antecedentes}
    />
    <ClinicalEvaluationHtml
      talla={talla}
      peso={peso}
      imc={imc}
      aspectoGeneral={aspectoGeneral}
    />
    <VisualAcuityHtml
      withoutCorrection={visualWithout}
      withCorrection={visualWith}
      chromaticVision={visualChromatic}
      notes={visualNotes}
    />
 
    {/* <PhysicalEvaluationHtml examenFisico={examenFisico} section={1} /> */}
   <FooterHtml
      pageNumber={2}
      primaryDoctor={{
        name: "BONIFACIO Ma. CECILIA",
        license: "M.P. 96533 - M.L. 7299",
        signatureUrl: "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
      }}
    />
  </>
);

export default SecondPageHTML;
