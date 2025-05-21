import { Document } from "@react-pdf/renderer";
import FirstPagePdfDocument from "../First-Page";
import SecondPagePdfDocument from "../Second-Page";
import ThirdPagePdfDocument from "../Third-Page";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { ExamenClinico } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";
import StudyPagePdfDocument from "../Study-Page";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import {
  aspectoGeneralyTiempolibre,
  mapClinicalEvaluation,
  mapConclusionAndRecommendationsData,
  mapExamResults,
  mapPhysicalEvaluation,
  PhysicalEvaluation,
} from "@/common/helpers/maps";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  medicalEvaluationType: string;
  dataValues: DataValue[] | undefined;
}

const PDFDocument = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
}: Props) => {
  const antecedentes = dataValues?.filter(
    (item) => item.dataType.category === "ANTECEDENTES"
  );
  const { conclusion, recomendaciones } = mapConclusionAndRecommendationsData(dataValues!);
  const examResults: ExamResults = mapExamResults(dataValues!);
  const clinicalEvaluation: ExamenClinico = mapClinicalEvaluation(dataValues!);
  const infoGeneral = aspectoGeneralyTiempolibre(dataValues!);
  const physicalEvaluation: PhysicalEvaluation = mapPhysicalEvaluation(
    dataValues!
  );
  const filteredStudies = studies?.filter(
    (s) => s.dataTypeName !== medicalEvaluationType
  );
  return (
    <Document>
      <FirstPagePdfDocument
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        antecedentes={antecedentes}
        recomendaciones={recomendaciones}
        medicalEvaluationType={medicalEvaluationType}
      />
      <SecondPagePdfDocument
        collaborator={collaborator}
        talla={clinicalEvaluation.talla}
        peso={clinicalEvaluation.peso}
        imc={clinicalEvaluation.imc}
        examResults={examResults}
        antecedentes={antecedentes}
        aspectoGeneral={infoGeneral.aspectoGeneral}
        tiempoLibre={infoGeneral.tiempoLibre}
        frecuenciaCardiaca={clinicalEvaluation.frecuenciaCardiaca}
        frecuenciaRespiratoria={clinicalEvaluation.frecuenciaRespiratoria}
        perimetroAbdominal={clinicalEvaluation.perimetroAbdominal}
        presionDiastolica={clinicalEvaluation.presionDiastolica}
        presionSistolica={clinicalEvaluation.presionSistolica}
        examenFisico={physicalEvaluation}
      />
      <ThirdPagePdfDocument
        examenFisico={physicalEvaluation}
        examResults={examResults}
      />
      {filteredStudies?.map((study, index) => (
        <StudyPagePdfDocument
          key={index}
          studyTitle={`${study.dataTypeName}`}
          studyUrl={study.url}
          examResults={examResults}
          pageNumber={4 + index}
        />
      ))}
    </Document>
  );
};

export default PDFDocument;
