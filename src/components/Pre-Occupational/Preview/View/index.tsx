import React from "react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import FirstPageHTML from "./First-Page";
import SecondPageHTML from "./Second-Page";
import ThirdPageHTML from "./Third-Page";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import StudyPageHtml from "./Study-Page";
import { DataValue } from "@/types/Data-Value/Data-Value";
import {
  mapClinicalEvaluation,
  mapConclusionData,
  mapExamResults,
  PhysicalEvaluation,
  mapPhysicalEvaluation,
  aspectoGeneralyTiempolibre,
} from "@/common/helpers/maps";
import {
  ExamenClinico,
  ExamResults,
} from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  medicalEvaluationType: string;
  dataValues: DataValue[];
}

const View: React.FC<Props> = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
}) => {
  const examResults: ExamResults = mapExamResults(dataValues);
  const { conclusion, conclusionOptions } = mapConclusionData(dataValues);
  const clinicalEvaluation: ExamenClinico = mapClinicalEvaluation(dataValues);
  const infoGeneral = aspectoGeneralyTiempolibre(dataValues);
  const physicalEvaluation: PhysicalEvaluation =
    mapPhysicalEvaluation(dataValues);
  return (
    <div>
      <FirstPageHTML
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        conclusionOptions={conclusionOptions}
        medicalEvaluationType={medicalEvaluationType}
      />
      <SecondPageHTML
        collaborator={collaborator}
        talla={clinicalEvaluation.talla}
        peso={clinicalEvaluation.peso}
        imc={clinicalEvaluation.imc}
        examenFisico={physicalEvaluation}
        aspectoGeneral={infoGeneral.aspectoGeneral}
        tiempoLibre={infoGeneral.tiempoLibre}
        frecuenciaCardiaca={clinicalEvaluation.frecuenciaCardiaca}
        frecuenciaRespiratoria={clinicalEvaluation.frecuenciaRespiratoria}
        perimetroAbdominal={clinicalEvaluation.perimetroAbdominal}
        presionDiastolica={clinicalEvaluation.presionDiastolica}
        presionSistolica={clinicalEvaluation.presionSistolica}
      />
      <ThirdPageHTML examenFisico={physicalEvaluation} />
      {studies?.map((study, index) => (
        <StudyPageHtml
          key={index}
          studyTitle={`${study.dataTypeName}`}
          studyUrl={study.url}
          pageNumber={4 + index}
        />
      ))}
    </div>
  );
};

export default View;
