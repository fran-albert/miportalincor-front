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
  hasSectionData,
  mapClinicalEvaluation,
  mapConclusionAndRecommendationsData,
  mapExamResults,
  mapMedicalEvaluation,
} from "@/common/helpers/maps";
import FourthPagePdfDocument from "../Fourth-Page";
import FifthPagePdfDocument from "../Fifth-Page";
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
  dataValues: DataValue[] | undefined;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
  reportVisibilityOverrides?: Partial<
    Record<ReportSectionKey, ReportVisibilityMode>
  >;
}

const PDFDocument = ({
  collaborator,
  studies,
  dataValues,
  medicalEvaluationType,
  doctorData,
  brandingConfig,
  reportVisibilityOverrides,
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
    <Document>
      <FirstPagePdfDocument
        collaborator={collaborator}
        examResults={examResults}
        conclusion={conclusion}
        antecedentes={antecedentes}
        recomendaciones={recomendaciones}
        medicalEvaluationType={medicalEvaluationType}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        pageNumber={1}
      />
      <SecondPagePdfDocument
        collaborator={collaborator}
        talla={clinicalEvaluation.talla}
        peso={clinicalEvaluation.peso}
        imc={clinicalEvaluation.imc}
        medicalEvaluationType={medicalEvaluationType}
        antecedentes={antecedentes}
        doctorData={doctorData}
        data={medicalEvaluation}
        aspectoGeneral={infoGeneral.aspectoGeneral}
        brandingConfig={brandingConfig}
        pageNumber={2}
      />
      <ThirdPagePdfDocument
        data={medicalEvaluation}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        pielData={medicalEvaluation.piel!}
        medicalEvaluationType={medicalEvaluationType}
        pageNumber={thirdPageNumber}
      />
      <FourthPagePdfDocument
        data={medicalEvaluation}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        medicalEvaluationType={medicalEvaluationType}
        pageNumber={fourthPageNumber}
      />
      <FifthPagePdfDocument
        collaboratorGender={collaborator.gender}
        genitourinaryGynObVisibilityMode={
          reportVisibilityOverrides?.genitourinary_gyn_ob
        }
        medicalEvaluationType={medicalEvaluationType}
        data={medicalEvaluation}
        doctorData={doctorData}
        brandingConfig={brandingConfig}
        pageNumber={fifthPageNumber}
      />
      {studies?.map((study, index) => (
        <StudyPagePdfDocument
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
    </Document>
  );
};

export default PDFDocument;
