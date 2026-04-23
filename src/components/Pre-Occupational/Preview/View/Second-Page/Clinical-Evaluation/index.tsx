import React from "react";
import { InfoField } from "@/components/InfoField";
import AspectoGeneralCheckboxes from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/AspectoGeneralCheckbox";

interface ClinicalEvaluationHtmlProps {
  talla?: string;
  peso?: string;
  imc?: string;
  aspectoGeneral?: string;
  tiempoLibre?: string;
  isEditing?: boolean;
  handleAspectoGeneralChange?: (value: string) => void;
}

const ClinicalEvaluationHtml: React.FC<ClinicalEvaluationHtmlProps> = ({
  talla,
  peso,
  imc,
  aspectoGeneral,
  isEditing = false,
  handleAspectoGeneralChange = () => {},
}) => {
  return (
    <div className="p-2">
      {/* Encabezado */}
      <div className="flex justify-center mb-2">
        <p className="text-xl font-bold">Resultados del Examen</p>
      </div>

      {/* Aspecto General */}
      <div className="mb-4">
        <AspectoGeneralCheckboxes
          isEditing={isEditing}
          medicalEvaluation={{ aspectoGeneral }}
          handleAspectoGeneralChange={handleAspectoGeneralChange}
        />
      </div>

      {/* Peso / Talla / IMC */}
      <div className="flex justify-between items-center mb-6">
        <InfoField label="Peso:" value={peso} />
        <InfoField label="Talla:" value={talla} />
        <InfoField label="IMC:" value={imc} />
      </div>

      {/* <div className="flex justify-between">
        <InfoField label="Perímetro Abdominal:" value={perimetroAbdominal} />
        <InfoField label="Frecuencia Cardíaca:" value={frecuenciaCardiaca} />
        <InfoField
          label="Frecuencia Respiratoria:"
          value={frecuenciaRespiratoria}
        />
        <InfoField label="Presión Sistólica:" value={presionSistolica} />
        <InfoField label="Presión Diastólica:" value={presionDiastolica} />
      </div> */}
    </div>
  );
};

export default ClinicalEvaluationHtml;
