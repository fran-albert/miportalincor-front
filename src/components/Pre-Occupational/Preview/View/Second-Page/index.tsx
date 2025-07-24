import { Collaborator } from "@/types/Collaborator/Collaborator";
import HeaderPreviewHtml from "../../Header";
import CollaboratorInformationHtml from "../../Collaborator-Information";
import ClinicalEvaluationHtml from "./Clinical-Evaluation";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityHtml from "./Visual";
import FooterHtmlConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
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
  doctorData: DoctorSignatures;
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
  doctorData,
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
    <FooterHtmlConditional
      pageNumber={2}
      useCustom
      doctorLicense={doctorData.matricula}
      doctorName={doctorData.fullName}
      doctorSpeciality={doctorData.specialty}
      signatureUrl={doctorData.signatureDataUrl}
    />
  </>
);

export default SecondPageHTML;
