import { Document } from "@react-pdf/renderer";
import FirstPagePdfDocument from "../First-Page";
import SecondPagePdfDocument from "../Second-Page";
import ThirdPagePdfDocument from "../Third-Page";
import StudyPagePdfDocument from "../Study-Page";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import {
  ExamResults,
  IMedicalEvaluation,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  examResults: ExamResults;
  conclusion: string;
  recomendaciones: string;
  medicalEvaluation: IMedicalEvaluation;
  medicalEvaluationType: string;
  dataValues: DataValue[] | undefined;
}

const PDFDocument = ({
  collaborator,
  studies,
  examResults,
  conclusion,
  recomendaciones,
  medicalEvaluation,
  dataValues,
  medicalEvaluationType,
}: Props) => {
  const antecedentes = dataValues?.filter(
    (item) => item.dataType.category === "ANTECEDENTES"
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
        talla={medicalEvaluation.examenClinico.talla}
        peso={medicalEvaluation.examenClinico.peso}
        imc={medicalEvaluation.examenClinico.imc}
        antecedentes={antecedentes}
        aspectoGeneral={medicalEvaluation.aspectoGeneral}
        tiempoLibre={medicalEvaluation.tiempoLibre}
        frecuenciaCardiaca={medicalEvaluation.examenClinico.frecuenciaCardiaca}
        frecuenciaRespiratoria={
          medicalEvaluation.examenClinico.frecuenciaRespiratoria
        }
        perimetroAbdominal={medicalEvaluation.examenClinico.perimetroAbdominal}
        presionDiastolica={medicalEvaluation.examenClinico.presionDiastolica}
        presionSistolica={medicalEvaluation.examenClinico.presionSistolica}
        examenFisico={medicalEvaluation.examenFisico}
      />
      <ThirdPagePdfDocument examenFisico={medicalEvaluation.examenFisico} />
      {studies?.map((study, index) => (
        <StudyPagePdfDocument
          key={index}
          studyTitle={`${study.dataTypeName}`}
          studyUrl={study.url}
          pageNumber={4 + index}
        />
      ))}
    </Document>
  );
};

export default PDFDocument;
