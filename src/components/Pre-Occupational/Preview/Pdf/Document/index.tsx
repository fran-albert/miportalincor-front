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
  mapMedicalEvaluation,
} from "@/common/helpers/maps";
import FourthPagePdfDocument from "../Fourth-Page";
import FifthPagePdfDocument from "../Fifth-Page";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  medicalEvaluationType: string;
  dataValues: DataValue[] | undefined;
  doctorData: DoctorSignatures;
}

const PDFDocument = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
  doctorData,
}: Props) => {
  const antecedentes = dataValues?.filter(
    (item) => item.dataType.category === "ANTECEDENTES"
  );
  const { conclusion, recomendaciones } = mapConclusionAndRecommendationsData(
    dataValues!
  );
  const examResults: ExamResults = mapExamResults(dataValues!);
  const clinicalEvaluation: ExamenClinico = mapClinicalEvaluation(dataValues!);
  const infoGeneral = aspectoGeneralyTiempolibre(dataValues!);
  const medicalEvaluation = mapMedicalEvaluation(dataValues!);
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
        antecedentes={antecedentes}
        doctorData={doctorData}
        data={medicalEvaluation}
        aspectoGeneral={infoGeneral.aspectoGeneral}
      />
      <ThirdPagePdfDocument
        data={medicalEvaluation}
        doctorData={doctorData}
        pielData={medicalEvaluation.piel!}
      />
      <FourthPagePdfDocument data={medicalEvaluation} doctorData={doctorData} />
      <FifthPagePdfDocument data={medicalEvaluation} doctorData={doctorData} />
      {studies?.map((study, index) => (
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
