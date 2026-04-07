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
  hasSectionData,
} from "@/common/helpers/maps";
import { ExamenClinico } from "@/store/Pre-Occupational/preOccupationalSlice";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import FourthPageHTML from "./Fourth-Page";
import FifthPageHTML from "./Fifth-Page";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  ReportSectionKey,
  ReportVisibilityMode,
  resolveReportVisibility,
} from "@/common/helpers/report-visibility";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  medicalEvaluationType: string;
  dataValues: DataValue[];
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  reportVisibilityOverrides?: Partial<
    Record<ReportSectionKey, ReportVisibilityMode>
  >;
}

const View: React.FC<Props> = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
  doctorData,
  brandingConfig,
  reportVisibilityOverrides,
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
  const hasThirdPage =
    hasSectionData(medicalEvaluation.piel) ||
    hasSectionData(medicalEvaluation.cabezaCuello) ||
    hasSectionData(medicalEvaluation.bucodental) ||
    hasSectionData(medicalEvaluation.torax);
  const hasFourthPage =
    hasSectionData(medicalEvaluation.respiratorio) ||
    hasSectionData(medicalEvaluation.circulatorio) ||
    hasSectionData(medicalEvaluation.neurologico);
  const hasGinecoData =
    Boolean(medicalEvaluation.genitourinario?.fum?.trim()) ||
    Boolean(medicalEvaluation.genitourinario?.partos?.trim()) ||
    Boolean(medicalEvaluation.genitourinario?.cesarea?.trim()) ||
    Boolean(medicalEvaluation.genitourinario?.embarazos?.trim());
  const gynObVisibility = resolveReportVisibility({
    sectionKey: "genitourinary_gyn_ob",
    visibilityMode: reportVisibilityOverrides?.genitourinary_gyn_ob,
    collaboratorGender: collaborator.gender,
    hasData: hasGinecoData,
  });
  const hasVisibleGenitourinario =
    medicalEvaluation.genitourinario?.sinAlteraciones !== undefined ||
    medicalEvaluation.genitourinario?.varicocele !== undefined ||
    Boolean(medicalEvaluation.genitourinario?.observaciones?.trim()) ||
    Boolean(medicalEvaluation.genitourinario?.varicoceleObs?.trim()) ||
    gynObVisibility.resolvedVisibility === "visible";
  const hasFifthPage =
    hasSectionData(medicalEvaluation.gastrointestinal) ||
    hasSectionData(medicalEvaluation.osteoarticular) ||
    hasVisibleGenitourinario;
  const thirdPageNumber = 3;
  const fourthPageNumber = thirdPageNumber + (hasThirdPage ? 1 : 0);
  const fifthPageNumber = fourthPageNumber + (hasFourthPage ? 1 : 0);
  const firstStudyPageNumber = fifthPageNumber + (hasFifthPage ? 1 : 0);
  return (
    <div>
      <FirstPageHTML
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        recomendaciones={recomendaciones}
        antecedentes={antecedentes}
        medicalEvaluationType={medicalEvaluationType}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        pageNumber={1}
      />
      <SecondPageHTML
        collaborator={collaborator}
        talla={clinicalEvaluation.talla}
        peso={clinicalEvaluation.peso}
        imc={clinicalEvaluation.imc}
        medicalEvaluationType={medicalEvaluationType}
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
        brandingConfig={brandingConfig}
        pageNumber={2}
      />
      <ThirdPageHTML
        pielData={medicalEvaluation.piel!}
        cabezaCuello={medicalEvaluation.cabezaCuello!}
        bucodental={medicalEvaluation.bucodental!}
        torax={medicalEvaluation.torax!}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        medicalEvaluationType={medicalEvaluationType}
        pageNumber={thirdPageNumber}
      />
      <FourthPageHTML
        neurologico={medicalEvaluation.neurologico!}
        respiratorio={medicalEvaluation.respiratorio!}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        circulatorio={medicalEvaluation.circulatorio!}
        medicalEvaluationType={medicalEvaluationType}
        pageNumber={fourthPageNumber}
      />
      <FifthPageHTML
        collaboratorGender={collaborator.gender}
        genitourinaryGynObVisibilityMode={
          reportVisibilityOverrides?.genitourinary_gyn_ob
        }
        gastrointestinal={medicalEvaluation.gastrointestinal!}
        genitourinario={medicalEvaluation.genitourinario!}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        osteoarticular={medicalEvaluation.osteoarticular!}
        medicalEvaluationType={medicalEvaluationType}
        pageNumber={fifthPageNumber}
      />
      {studies?.map((study, index) => (
        <StudyPageHtml
          key={index}
          studyTitle={`${study.dataTypeName}`}
          studyUrl={study.url}
          examResults={examResults}
          pageNumber={firstStudyPageNumber + index}
          medicalEvaluationType={medicalEvaluationType}
          doctorData={doctorData}
          brandingConfig={brandingConfig}
        />
      ))}
    </div>
  );
};

export default View;
