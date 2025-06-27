import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import FooterHtml from "../Footer";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityHtml from "./Visual";
import {
  Piel,
  PielSection,
} from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import CabezaCuelloHtml from "./CabezaCuello";
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
  pielData: Piel;
  cabezaCuello: { sinAlteraciones: boolean; observaciones: string };
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
  pielData,
  cabezaCuello,
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
    <PielSection isEditing={false} data={pielData} />
    <CabezaCuelloHtml data={cabezaCuello} />
    {/* <PhysicalEvaluationHtml examenFisico={examenFisico} section={1} /> */}
    <FooterHtml
      pageNumber={2}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default SecondPageHTML;
