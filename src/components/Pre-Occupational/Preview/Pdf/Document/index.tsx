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

interface Props {
  collaborator: Collaborator;
  studies?: GetUrlsResponseDto[];
  examResults: ExamResults;
  conclusion: string;
  conclusionOptions: any;
  medicalEvaluation: IMedicalEvaluation;
  medicalEvaluationType: string;
}

const PDFDocument = ({
  collaborator,
  studies,
  examResults,
  conclusion,
  conclusionOptions,
  medicalEvaluation,
  medicalEvaluationType,
}: Props) => {
  return (
    <Document>
      <FirstPagePdfDocument
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        conclusionOptions={conclusionOptions}
        medicalEvaluationType={medicalEvaluationType}
      />
      <SecondPagePdfDocument
        collaborator={collaborator}
        talla={medicalEvaluation.examenClinico.talla}
        peso={medicalEvaluation.examenClinico.peso}
        imc={medicalEvaluation.examenClinico.imc}
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
