import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import FooterHtml from "../Footer";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import PhysicalEvaluationHtml from "./Physical-Evaluationn";
import { DataValue } from "@/types/Data-Value/Data-Value";

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
}

const SecondPageHTML = ({
  collaborator,
  peso,
  talla,
  imc,
  examenFisico,
  tiempoLibre,
  frecuenciaCardiaca,
  frecuenciaRespiratoria,
  presionDiastolica,
  presionSistolica,
  perimetroAbdominal,
  aspectoGeneral,
  antecedentes,
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
      tiempoLibre={tiempoLibre}
      frecuenciaCardiaca={frecuenciaCardiaca}
      frecuenciaRespiratoria={frecuenciaRespiratoria}
      perimetroAbdominal={perimetroAbdominal}
      presionSistolica={presionSistolica}
      presionDiastolica={presionDiastolica}
    />
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
