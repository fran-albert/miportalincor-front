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
  mapExamResults,
  PhysicalEvaluation,
  mapPhysicalEvaluation,
  aspectoGeneralyTiempolibre,
  mapConclusionAndRecommendationsData,
  mapMedicalEvaluation,
} from "@/common/helpers/maps";
import { ExamenClinico } from "@/store/Pre-Occupational/preOccupationalSlice";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import FourthPageHTML from "./Fourth-Page";
import FifthPageHTML from "./Fifth-Page";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  medicalEvaluationType: string;
  dataValues: DataValue[];
  doctorData: DoctorSignatures;
}

const View: React.FC<Props> = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
  doctorData,
}) => {
  const examResults: ExamResults = mapExamResults(dataValues);
  const { conclusion, recomendaciones } =
    mapConclusionAndRecommendationsData(dataValues);
  const clinicalEvaluation: ExamenClinico = mapClinicalEvaluation(dataValues);
  const infoGeneral = aspectoGeneralyTiempolibre(dataValues);
  const physicalEvaluation: PhysicalEvaluation =
    mapPhysicalEvaluation(dataValues);
  const antecedentes = dataValues.filter(
    (item) => item.dataType.category === "ANTECEDENTES"
  );
  const medicalEvaluation = mapMedicalEvaluation(dataValues);
  return (
    <div>
      <FirstPageHTML
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        recomendaciones={recomendaciones}
        antecedentes={antecedentes}
        medicalEvaluationType={medicalEvaluationType}
      />
      <SecondPageHTML
        collaborator={collaborator}
        talla={clinicalEvaluation.talla}
        peso={clinicalEvaluation.peso}
        imc={clinicalEvaluation.imc}
        antecedentes={antecedentes}
        examenFisico={physicalEvaluation}
        aspectoGeneral={infoGeneral.aspectoGeneral}
        tiempoLibre={infoGeneral.tiempoLibre}
        frecuenciaCardiaca={clinicalEvaluation.frecuenciaCardiaca}
        frecuenciaRespiratoria={clinicalEvaluation.frecuenciaRespiratoria}
        perimetroAbdominal={clinicalEvaluation.perimetroAbdominal}
        presionDiastolica={clinicalEvaluation.presionDiastolica}
        presionSistolica={clinicalEvaluation.presionSistolica}
        visualChromatic={medicalEvaluation.visionCromatica!}
        visualWithout={medicalEvaluation.agudezaSc}
        visualWith={medicalEvaluation.agudezaCc}
        visualNotes={medicalEvaluation.notasVision}
        doctorData={doctorData}
      />
      <ThirdPageHTML
        pielData={medicalEvaluation.piel!}
        cabezaCuello={medicalEvaluation.cabezaCuello!}
        bucodental={medicalEvaluation.bucodental!}
        torax={medicalEvaluation.torax!}
        doctorData={doctorData}
      />
      <FourthPageHTML
        neurologico={medicalEvaluation.neurologico!}
        respiratorio={medicalEvaluation.respiratorio!}
        doctorData={doctorData}
        circulatorio={medicalEvaluation.circulatorio!}
      />
      <FifthPageHTML
        gastrointestinal={medicalEvaluation.gastrointestinal!}
        genitourinario={medicalEvaluation.genitourinario!}
        doctorData={doctorData}
        osteoarticular={medicalEvaluation.osteoarticular!}
      />
      {studies?.map((study, index) => (
        <StudyPageHtml
          key={index}
          studyTitle={`${study.dataTypeName}`}
          studyUrl={study.url}
          examResults={examResults}
          pageNumber={4 + index}
        />
      ))}
    </div>
  );
};

export default View;
